from flask import jsonify
from werkzeug.exceptions import HTTPException, default_exceptions

from backend import app, db


@app.shell_context_processor
def make_shell_context():
    return {"db": db, "app": app}


@app.teardown_request
def teardown_request(exception):
    if exception:
        db.session.rollback()
    db.session.remove()


@app.errorhandler(Exception)
def handle_invalid_usage(error):
    app.logger.error(error)
    return jsonify(message="An error occured", code=500), 500


def handle_error(error):
    if isinstance(error, HTTPException):

        if error.code == 500:
            app.logger.error(error)
        else:
            app.logger.info(error)

        return jsonify(message=error.description, code=error.code), error.code
    return jsonify(message="An error occured", code=500), 500


for exc in default_exceptions:
    app.register_error_handler(exc, handle_error)
