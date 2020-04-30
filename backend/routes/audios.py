import os

from flask import send_from_directory, jsonify
from flask_login import login_required, current_user

from backend import app

from backend.models import Data


@app.route("/audios/<path:file_name>")
def send_audio_file(file_name):
    try:
        return send_from_directory(app.config["UPLOAD_FOLDER"], file_name)
    except Exception as e:
        app.logger.error(e)
        return jsonify(message="Error loading the audio"), 404
