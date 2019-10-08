from flask import send_from_directory

from sat import app

@app.route('/audio/<path:filename>')  
def send_audio_file(filename):
    directory = ''

    return send_from_directory(directory, filename)
