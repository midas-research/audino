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
            end_time=segment["end_time"],
            start_time=segment["start_time"],
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

# TODO: Add authentication
@api.route("/datazip", methods=["POST"])
# @jwt_required
def add_datazip():
    # identity = get_jwt_identity()
    # request_user = User.query.filter_by(username=identity["username"]).first()
    # app.logger.info(f"Current user is: {request_user}")
    # is_admin = True if request_user.role.role == "admin" else False

    # if is_admin == False:
    #     return jsonify(message="Unauthorized access!"), 401

    # if not request.is_json:
    #     return jsonify(message="Missing JSON in request"), 400

    pid = request.form.get("projectId", None)
    uid = request.form.get("userId", None)
    project = Project.query.filter_by(id=pid).first()
    user = User.query.filter_by(username=uid).first()

    files = request.files.items()

    app.logger.info(f"user: {user} / project: {project}")

    for _, audio_file in files:
        filename = audio_file.filename
        filename_ext = Path(filename).suffix.lower()
        if filename_ext[1:] in ALLOWED_COMPRESSED_EXTENSIONS:
            app.logger.info(f"Compressed file in consideration: {filename}")
            with ZipFile(audio_file, "r") as zip_obj:
                for cmprsd_filename in zip_obj.namelist():
                    app.logger.info(f"cmpressed files are: {cmprsd_filename}")
                    cmprsd_extension = Path(cmprsd_filename).suffix.lower()
                    if cmprsd_extension[1:] in ALLOWED_EXTENSIONS:
                        zip_obj.extract(
                            cmprsd_filename,
                            app.config["UPLOAD_FOLDER"]
                        )
                        tfilename = f"{str(uuid.uuid4().hex)}{cmprsd_extension}"
                        shutil.move(
                            Path(app.config["UPLOAD_FOLDER"]).joinpath(cmprsd_filename), Path(
                                app.config["UPLOAD_FOLDER"]).joinpath(tfilename)
                        )
                        data = Data(
                            project_id=project.id,
                            filename=tfilename,
                            original_filename=cmprsd_filename,
                            reference_transcription="",
                            is_marked_for_review=True,
                            assigned_user_id=user.id,
                        )


                        db.session.add(data)
                        db.session.flush()
                        db.session.commit()

                    elif cmprsd_extension[1:] in ALLOWED_ANNOTATION_EXTENSIONS:
                        pass
                        # reading the file, temp store it
                        temp_loc = Path(app.config["UPLOAD_FOLDER"]
                                        ).joinpath(cmprsd_filename)
                        zip_obj.extract(cmprsd_filename,
                                        app.config["UPLOAD_FOLDER"])
                        segmentations = json.load(open(temp_loc, "r"))
                        for _segment in segmentations:
                            validated = validate_segmentation(_segment, without_data=True)

                            # if not validated:
                            #     continue  # skip this datapoint

                            if validated:
                                try:
                                    data = Data.query.filter_by(
                                        project_id=pid, original_filename=_segment['filename']).first()

                                    if data.id:
                                        app.logger.info(f"seraching for segments: {data.id}")

                                        new_segment = generate_segmentation(
                                            data_id=data.id,
                                            project_id=project.id,
                                            end_time=_segment["end_time"],
                                            start_time=_segment["start_time"],
                                            transcription=_segment["transcription"],
                                            annotations=_segment.get("annotations", {})
                                        )

                                        app.logger.info(
                                            f"will try to add data in: {data}")
                                        data.set_segmentations([new_segment])
                                        app.logger.info(f"new_segment: {new_segment.data_id}")
                                        db.session.refresh(data)
                                        db.session.commit()
                                except Exception as e:
                                    app.logger.info(f"Error {e} for data: {data.id}")

    return jsonify(
        resp="HAHA"
    )
