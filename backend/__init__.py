import os

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from werkzeug.exceptions import HTTPException, default_exceptions

from backend.config import Config


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object(Config)

    return app


app = create_app()

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
redis_client = FlaskRedis(app)
# login = LoginManager(app)
# login.login_view = "routes.login"

from backend import models


def handle_error(error):
    if isinstance(error, HTTPException):
        return jsonify(message=error.description, code=error.code)
    return jsonify(message="An error occured", code=500)


for exc in default_exceptions:
    app.register_error_handler(exc, handle_error)


# @login.user_loader
# def load_user(id):
#     return models.User.query.get(int(id))


from .routes import auth, api

app.register_blueprint(auth)
app.register_blueprint(api)
# app.add_template_global(name='version', f='1.0')
