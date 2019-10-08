import os

from flask import send_from_directory

from sat import app

@app.route('/audio/<path:file>')  
def send_audio_file(file):
    file = '/' + file

    file_name = os.path.basename(file)
    file_directory = os.path.dirname(file)
    
    return send_from_directory(file_directory, file_name)
