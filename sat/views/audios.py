import os

from flask import send_from_directory
from flask_login import login_required, current_user

from sat import app

from sat.models import Data


@app.route('/audio/<path:file_id>')  
def send_audio_file(file_id):
    data = Data.query.filter_by(user_id=current_user.id, id=file_id).first()

    file_name = os.path.basename(data.file)
    file_directory = os.path.dirname(data.file)
    
    return send_from_directory(file_directory, file_name)
