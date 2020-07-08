import sqlalchemy as sa
import uuid

from pathlib import Path

from flask import jsonify, flash, redirect, url_for, request, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse
from werkzeug.utils import secure_filename

from backend import app, db
from backend.models import Data, Project, User, Segmentation

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

        segmentations = db.session.query(
            Segmentation.data_id).distinct().subquery()

        currdata = Data.query.filter_by(id="82", project_id="4").first()
        data = {}
        data = (
            db.session.query(Data)
            # .filter(Data.assigned_user_id == "1")
            .filter(Data.project_id == "4")
            # .filter(Data.id.in_(segmentations))
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.created_at.desc())
        )
        before, after = data[0], data[-1]
        index = list(data).index(currdata)
        before, after = data[index-1], data[index+1]

        # nextctr = 0
        # for dat in data:
        #     app.logger.info(f"interation {dat.id}")
        #     if nextctr == 1:
        #         nextdata = dat
        #         break
        #     if dat == currdata:
        #         nextctr = 1
        #     else:
        #         lastone = dat

        app.logger.info(f"Total numer of data is {currdata}")
        app.logger.info(
            f"Total numer of segmentations is {currdata.is_marked_for_review}")
        # app.logger.info(f"Total numer of segmentations is {len(segmentations)}")
        # data = Data(
        #     project_id=project.id,
        #     filename=filename,
        #     original_filename=original_filename,
        #     reference_transcription=reference_transcription,
        #     is_marked_for_review=is_marked_for_review,
        #     assigned_user_id=user.id,
        # )
        # db.session.add(data)
        # db.session.commit()
        # db.session.refresh(data)
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
            data_id="69",
            # data_id=data.id,
            message=f"Data uploaded, created and assigned successfully",
            type="DATA_CREATED",
        ),
        201,
    )
