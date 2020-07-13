import json
import sqlalchemy as sa
import uuid

from pathlib import Path

from flask import jsonify, flash, redirect, url_for, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename

from backend import app, db
from backend.models import Data, Project, User, Segmentation, Label, LabelValue

from . import api

ALLOWED_EXTENSIONS = ["wav", "mp3", "ogg"]


@api.route("/audio/<path:file_name>", methods=["GET"])
@jwt_required
def send_audio_file(file_name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)


class LabelNotFoundError(Exception):
    """Exception raised when label or labelvalue is not found
    """

    def __init__(self, value, mapping):
        self.message = f"{value} does not exist in current mapping of {mapping}"
        super().__init__(self.message)


def validate_segmentation(segment):
    """Validate the segmentation before accepting the annotation's upload from users
    """
    required_key = {"annotations", "start_time", "end_time", "transcription"}

    if set(required_key).issubset(segment.keys()):
        return True
    else:
        return False


def generate_segmentation(
    annotations, transcription, project_id,
    start_time, end_time, data_id=None, segmentation_id=None
):
    """Generate a Segmentation from the required segment information
    """
    if segmentation_id is None:
        # segmentation created for new data
        if data_id is None:
            segmentation = Segmentation(
                start_time=start_time, end_time=end_time
            )
        # segmetation created for existing data
        else:
            segmentation = Segmentation(
                data_id=data_id, start_time=start_time, end_time=end_time
            )
    else:
        # segmentation updated for existing data
        segmentation = Segmentation.query.filter_by(
            data_id=data_id, id=segmentation_id
        ).first()
        segmentation.set_start_time(start_time)
        segmentation.set_end_time(end_time)

    segmentation.set_transcription(transcription)
    values = []
    if annotations:
        for label_name, label_value in annotations.items():
            app.logger.info(label_name)
            app.logger.info(label_value)
            if isinstance(label_value, list):
                label = Label.query.filter_by(
                    name=label_name, project_id=project_id).first()
                if label is None:
                    raise LabelNotFoundError(value=label_name, mapping="Label")

                for _value in label_value:
                    value = LabelValue.query.filter_by(
                        value=_value, label_id=label.id
                    ).first()
                    if value is None:
                        raise LabelNotFoundError(value=_value, mapping="LabelValue")
                    values.append(value)

            elif isinstance(label_value["values"], list):
                for val_id in label_value["values"]:
                    value = LabelValue.query.filter_by(
                        id=int(val_id), label_id=label_value["label_id"]
                    ).first()
                    values.append(value)

            elif isinstance(label_value["values"], dict):
                label = Label.query.filter_by(
                    name=label_name, project_id=project_id).first()
                if label is None:
                    raise LabelNotFoundError(value=label_name, mapping="Label")

                value = LabelValue.query.filter_by(
                    id=int(label_value["values"]["id"]), label_id=label_value["id"]
                ).first()
                if value is None:
                    raise LabelNotFoundError(
                        value=label_value["values"]["value"], mapping="LabelValue")
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
    is_marked_for_review = bool(
        request.form.get("is_marked_for_review", False))
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
        segmentations = json.loads(segmentations)
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
                project_id=project.id,
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

    except AttributeError as e:
        app.logger.error(
            f"Error parsing segmentations, please make sure segmentations are passed as a list", e)
        return (
            jsonify(
                message=f"Error adding data to project: {project.name}",
                type="DATA_CREATION_FAILED",
            ),
            400,
        )

    except LabelNotFoundError as e:
        app.logger.error(e)
        return (
            jsonify(
                message=f"Error adding data to project: {project.name}",
                type="DATA_CREATION_FAILED",
            ),
            400,
        )

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
