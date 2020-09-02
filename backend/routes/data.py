import sqlalchemy as sa
import uuid

from pathlib import Path

from flask import jsonify, flash, redirect, url_for, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename

from backend import app, db
from backend.models import Data, Project, User

from . import api

ALLOWED_EXTENSIONS = ["wav", "mp3", "ogg"]


@api.route("/audio/<path:file_name>", methods=["GET"])
@jwt_required
def send_audio_file(file_name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)


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

        data = Data(
            project_id=project.id,
            filename=filename,
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

    from zipfile import ZipFile
    files = request.files.items()
    for filename, audio_file in files:
        # extract all the files and validate them
        with ZipFile(audio_file, "r") as zip_ref:
            for cmprsd_file in zip_ref.namelist():
                with zip_ref.open(cmprsd_file) as file_test:
                    pass
                # zip_ref.extractall("test")

    return jsonify(
        resp="HAHA"
    )


def validate_audio_file(audio_file):
    """Validate the audio file before adding saving it

    Args:
        audio_file (werkzeug.datastructures.FileStorage): The file to be validated before insertion
    """
    original_filename = secure_filename(audio_file.filename)
    extension = Path(original_filename).suffix.lower()

    if len(extension) > 1 and extension[1:] not in ALLOWED_EXTENSIONS:
        return False

    filename = f"{str(uuid.uuid4().hex)}{extension}"
    file_path = Path(app.config["UPLOAD_FOLDER"]).joinpath(filename)

    return file_path.as_posix()


def validate_annotation_file(annotation_file):
    """[summary]

    Args:
        annotation_file ([type]): [description]
    """

    return