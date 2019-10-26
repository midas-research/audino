import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

from .config import Config


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object(Config)

    return app


app = create_app()

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login = LoginManager(app)
login.login_view = 'routes.login'

from sat import models

@login.user_loader
def load_user(id):
    return models.User.query.get(int(id))


from .views import *
app.register_blueprint(views)
app.add_template_global(name='version', f='1.0')
