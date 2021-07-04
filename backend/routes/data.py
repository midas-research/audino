import os
import shutil
import json
import sqlalchemy as sa
import uuid

from pathlib import Path
from zipfile import ZipFile

from flask import jsonify, flash, redirect, url_for, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from backend import app, db
from backend.models import Data, Project, User, Segmentation, Label, LabelValue

from . import api

ALLOWED_COMPRESSED_EXTENSIONS = ["zip"]
ALLOWED_ANNOTATION_EXTENSIONS = ["json"]
ALLOWED_EXTENSIONS = ["wav", "mp3", "ogg"]

@api.route("/audio/<path:file_name>", methods=["GET"])
@jwt_required
def send_audio_file(file_name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)


def validate_segmentation(segment, without_data=False):
    """Validate the segmentation before accepting the annotation's upload from users
    """
    required_key = {"start_time", "end_time", "transcription"}
    if without_data:
        required_key.add("filename") # requried to search the datapoint

    if set(required_key).issubset(segment.keys()):
        return True
    else:
        return False


def generate_segmentation(
    annotations,
    transcription,
    project_id,
    start_time,
    end_time,
    data_id,
    segmentation_id=None,
):
    """Generate a Segmentation from the required segment information
    """
    if segmentation_id is None:
        segmentation = Segmentation(
            data_id=data_id,
            start_time=start_time,
            end_time=end_time,
            transcription=transcription,
        )
    else:
        # segmentation updated for existing data
        segmentation = Segmentation.query.filter_by(
            data_id=data_id, id=segmentation_id
        ).first()
        segmentation.set_start_time(start_time)
        segmentation.set_end_time(end_time)
        segmentation.set_transcription(transcription)

    db.session.add(segmentation)
    db.session.flush()

    values = []

    for label_name, val in annotations.items():
        label = Label.query.filter_by(name=label_name, project_id=project_id).first()

        if label is None:
            raise NotFound(description=f"Label not found with name: `{label_name}`")

        if "values" not in val:
            raise BadRequest(
                description=f"Key: `values` missing in Label: `{label_name}`"
            )

        label_values = val["values"]

        if isinstance(label_values, list):
            for val_id in label_values:

                value = LabelValue.query.filter_by(
                    id=int(val_id), label_id=int(label.id)
                ).first()

                if value is None:
                    raise BadRequest(
                        description=f"`{label_name}` does not have label value with id `{val_id}`"
                    )
                values.append(value)

        else:
            if label_values == "-1":
                continue

            value = LabelValue.query.filter_by(
                id=int(label_values), label_id=int(label.id)
            ).first()

            if value is None:
                raise BadRequest(
                    description=f"`{label_name}` does not have label value with id `{label_values}`"
                )
            values.append(value)

    segmentation.values = values
    return segmentation


@api.route("/data", methods=["POST"])
def add_data():
    api_key = request.headers.get("Authorization", None)

    if not api_key:
        raise BadRequest(description="API Key missing from `Authorization` Header")

    project = Project.query.filter_by(api_key=api_key).first()

    if not project:
        raise NotFound(description="No project exist with given API Key")

    username = request.form.get("username", None)
    user = User.query.filter_by(username=username).first()

    if not user:
        raise NotFound(description="No user found with given username")

    segmentations = request.form.get("segmentations", "[]")
    reference_transcription = request.form.get("reference_transcription", None)
    is_marked_for_review = bool(request.form.get("is_marked_for_review", False))
    audio_file = request.files["audio_file"]
    original_filename = secure_filename(audio_file.filename)

    extension = Path(original_filename).suffix.lower()

    if len(extension) > 1 and extension[1:] not in ALLOWED_EXTENSIONS:
        raise BadRequest(description="File format is not supported")

    filename = f"{str(uuid.uuid4().hex)}{extension}"

    file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
    audio_file.save(file_path.as_posix())

    data = Data(
        project_id=project.id,
        filename=filename,
        original_filename=original_filename,
        reference_transcription=reference_transcription,
        is_marked_for_review=is_marked_for_review,
        assigned_user_id=user.id,
    )
    db.session.add(data)
    db.session.flush()

    segmentations = json.loads(segmentations)

    new_segmentations = []

    for segment in segmentations:
        validated = validate_segmentation(segment)

        if not validated:
            raise BadRequest(description=f"Segmentations have missing keys.")

        new_segment = generate_segmentation(
            data_id=data.id,
            project_id=project.id,
            end_time=float(segment["end_time"]),
            start_time=float(segment["start_time"]),
            annotations=segment.get("annotations", {}),
            transcription=segment["transcription"],
        )

        new_segmentations.append(new_segment)

    data.set_segmentations(new_segmentations)

    db.session.commit()
    db.session.refresh(data)

    return (
        jsonify(
            data_id=data.id,
            message=f"Data uploaded, created and assigned successfully",
            type="DATA_CREATED",
        ),
        201,
    )


def files_from_zip(zip_file):
    """Generator for getting files from the a zip file

    Returns:
        Generator: if valid, generator of files in the zip
        False: if the file is invalid
    """
    with ZipFile(zip_file, "r") as zip_obj:
        for cfilename in zip_obj.namelist():
            cfile_extension = Path(cfilename).suffix.lower()
            if cfile_extension[1:] in ALLOWED_EXTENSIONS:
                zip_obj.extract(
                    cfilename,
                    Path(app.config["UPLOAD_FOLDER"])
                )
                yield Path(app.config["UPLOAD_FOLDER"]).joinpath(cfilename), "data"
            elif cfile_extension[1:] in ALLOWED_ANNOTATION_EXTENSIONS:
                zip_obj.extract(
                    cfilename,
                    Path(app.config["UPLOAD_FOLDER"])
                )
                yield Path(app.config["UPLOAD_FOLDER"]).joinpath(cfilename), "annotation"


def file_to_database(
    db,
    user,
    project,
    audio_file,
    is_marked_for_review,
    reference_transcription,
    compressed_file=False
):
    """Add data to database and save a copy in the /uploads folder

    TODO:
        - delete compressed file is there was some error
    """
    try:

        if compressed_file:
            original_filename = os.path.basename(audio_file)
            extension = Path(original_filename).suffix.lower()
            filename = f"{str(uuid.uuid4().hex)}{extension}"
            from_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(
                original_filename)
            to_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
            shutil.move(from_path, to_path)
        else:
            original_filename = secure_filename(audio_file.filename)
            extension = Path(original_filename).suffix.lower()
            filename = f"{str(uuid.uuid4().hex)}{extension}"
            file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
            audio_file.save(file_path.as_posix())

        data = Data(
            project_id=project.id,
            filename=filename,
            original_filename=original_filename,
            reference_transcription=reference_transcription,
            is_marked_for_review=is_marked_for_review,
            assigned_user_id=user.id,
        )
        db.session.add(data)
        db.session.flush()

        return True
    except Exception as e:
        if compressed_file:
            shutil.rmtree(path=from_path, ignore_errors=True)
            shutil.rmtree(path=to_path, ignore_errors=True)
        app.logger.error("Error in adding the data")
        app.logger.error(e)
        return False


def annotation_to_database(project, annotation_file):
    """Add segmentation to database from a json
    """
    ret_flag = False
    try:
        segmentations = json.load(annotation_file)
        for _segment in segmentations:
            validated = validate_segmentation(
                _segment, without_data=True
            )
            if validated:
                data = Data.query.filter_by(
                    project_id=project.id,
                    original_filename=_segment['filename']
                ).first()

                if data:
                    new_segment = generate_segmentation(
                        data_id=data.id,
                        project_id=project.id,
                        end_time=_segment["end_time"],
                        start_time=_segment["start_time"],
                        transcription=_segment["transcription"],
                        annotations=_segment.get(
                            "annotations", {})
                    )
                ret_flag = True

        # delete the annotations file from the disk if exists
        if hasattr(annotation_file, "name") and os.path.exists(annotation_file.name):
            os.remove(annotation_file.name)
        elif hasattr(annotation_file, "filename") and os.path.exists(annotation_file.filename):
            os.remove(annotation_file.filename)

        return ret_flag
    except Exception as e:
        app.logger.error("Error in adding the annotations")
        app.logger.error(e)
        return False
