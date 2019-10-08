from sat import app, db
from sat.models import User

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'app': app}
