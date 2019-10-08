import os

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from .config import Config
from .views import *


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object(Config)

    return app


app = create_app()
app.register_blueprint(views)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from sat import models
