import os

from pathlib import Path

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis

from backend.config import Config


def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object(Config)

    Path(app.config["UPLOAD_FOLDER"]).mkdir(parents=True, exist_ok=True)

    return app


app = create_app()

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
redis_client = FlaskRedis(app)

from backend import models

from .routes import auth, api

app.register_blueprint(auth)
app.register_blueprint(api)
