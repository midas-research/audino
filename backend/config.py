import os

from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL"
    ) or "sqlite:///" + os.path.join(basedir, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True if os.environ.get("SQLALCHEMY_ECHO") == "True" else False
    REDIS_URL = os.environ.get("JWT_REDIS_STORE_URL", "")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = os.environ.get(
        "JWT_ACCESS_TOKEN_EXPIRES", timedelta(days=7)
    )
    JWT_BLACKLIST_ENABLED = True
    JWT_HEADER_TYPE = None
    JWT_BLACKLIST_TOKEN_CHECKS = ["access"]
    UPLOAD_FOLDER = '/root/uploads'
