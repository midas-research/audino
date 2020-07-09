import json
import sqlalchemy as sa
import uuid

from pathlib import Path

from flask import jsonify, flash, redirect, url_for, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename

from backend import app, db
from backend.models import Data, Project, User, Segmentation, LabelValue

from . import api

ALLOWED_EXTENSIONS = ["wav", "mp3", "ogg"]


@api.route("/audio/<path:file_name>", methods=["GET"])
@jwt_required
def send_audio_file(file_name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)


def validate_segmentation(segment):
    """Validate the segmentation before accepting the annotation's upload from users
    """
    required_key = {"annotations", "end_time", "transcription"}

    if set(required_key).issubset(segment.keys()):
        return True
    else:
        return False


def generate_segmentation(
    annotations, transcription,
    start_time, end_time, data_id=None, segmentation_id=None
):
    """Generate a Segmentation from the required segment information
    """
    if segmentation_id is None:
        if data_id is None:
            segmentation = Segmentation(
                start_time=start_time, end_time=end_time
            )
        else:
            segmentation = Segmentation(
                data_id=data_id,
                start_time=start_time, end_time=end_time
            )
    else:
        segmentation = Segmentation.query.filter_by(
            data_id=data_id, id=segmentation_id
        ).first()

    segmentation.set_transcription(transcription)
    values = []
    for label_name, label_value in annotations.items():
        app.logger.info(label_name)
        app.logger.info(label_value)
        if type(label_value["values"]) is list:
            for val_id in label_value["values"]:
                value = LabelValue.query.filter_by(
                    id=int(val_id), label_id=label_value["label_id"]
                ).first()
                values.append(value)
        else:
            value = LabelValue.query.filter_by(
                id=int(label_value["values"]), label_id=label_value["label_id"]
            ).first()
            values.append(value)
    segmentation.values = values

    return segmentation


@api.route("/data", methods=["POST"])
def add_data():
    api_key = request.headers.get("Authorization", None)
    app.logger.info(api_key)

    if not api_key:
        return jsonify(message="API Key missing from `Authorization` Header"), 401

    try:
        project = Project.query.filter_by(api_key=api_key).first()
    except Exception as e:
        app.logger.info(e)
        return jsonify(message="No project exist with given API Key"), 404

    username = request.form.get("username", None)
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify(message="No user found with given username"), 404

    segmentations = request.form.get("segmentations", [])
    reference_transcription = request.form.get("reference_transcription", None)
    is_marked_for_review = bool(request.form.get("is_marked_for_review", False))
    audio_file = request.files["audio_file"]
    original_filename = secure_filename(audio_file.filename)

    extension = Path(original_filename).suffix.lower()

    if len(extension) > 1 and extension[1:] not in ALLOWED_EXTENSIONS:
        return jsonify(message="File format is not supported"), 400

    filename = f"{str(uuid.uuid4().hex)}{extension}"

    file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)
    audio_file.save(file_path.as_posix())

    app.logger.info(filename)
    try:

        if isinstance(segmentations, str):
            segmentations = json.loads(segmentations)
        elif segmentations != []:
            app.logger.error("Could not parse segmentations from ",
                            type(segmentations))
        annotations = []
        for segment in segmentations:
            validated = validate_segmentation(segment)

            if not validated:
                app.logger.error(f"Error adding segmentation: {segment}")
                return (
                    jsonify(
                        message=f"Error adding data to project: {project.name}",
                        type="DATA_CREATION_FAILED",
                    ),
                    400,
                )

            annotations.append(generate_segmentation(
                data_id=None,
                end_time=segment['end_time'],
                start_time=segment['start_time'],
                annotations=segment['annotations'],
                transcription=segment['transcription'],
            ))

        data = Data(
            project_id=project.id,
            filename=filename,
            segmentations=annotations,
            original_filename=original_filename,
            reference_transcription=reference_transcription,
            is_marked_for_review=is_marked_for_review,
            assigned_user_id=user.id,
        )

        db.session.add(data)
        db.session.commit()
        db.session.refresh(data)

    except Exception as e:
        app.logger.error(f"Error adding data to project: {project.name}")
        app.logger.error(e)
        return (
            jsonify(
                message=f"Error adding data to project: {project.name}",
                type="DATA_CREATION_FAILED",
            ),
            500,
        )

    return (
        jsonify(
            data_id=data.id,
            message=f"Data uploaded, created and assigned successfully",
            type="DATA_CREATED",
        ),
        201,
    )
