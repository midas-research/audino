from backend import app, db


@app.shell_context_processor
def make_shell_context():
    return {"db": db, "app": app}


@app.teardown_request
def teardown_request(exception):
    if exception:
        db.session.rollback()
    db.session.remove()
