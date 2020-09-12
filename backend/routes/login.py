from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    get_jti,
    get_raw_jwt,
)
from werkzeug.urls import url_parse

from backend import app, jwt, redis_client
from backend.models import User

from . import auth


@jwt.token_in_blacklist_loader
def check_if_token_is_revoked(decrypted_token):
    jti = decrypted_token["jti"]
    entry = redis_client.get(jti)

    if entry is None:
        return True

    return entry == "true"


@jwt.expired_token_loader
def my_expired_token_callback(expired_token):
    return jsonify(message="JWT has expired!", type="JWT_EXPIRED"), 401


@auth.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    username = request.json.get("username", None)
    password = request.json.get("password", None)

    if not username:
        return (
            jsonify(message="Please provide your username!", type="USERNAME_MISSING"),
            400,
        )
    if not password:
        return (
            jsonify(
                {"message": "Please provide your password!", "type": "PASSWORD_MISSING"}
            ),
            400,
        )

    user = User.query.filter_by(username=username).first()

    if user is None or not user.check_password(password):
        return (
            jsonify(
                message="Incorrect username or password!", type="INCORRECT_CREDENTIALS"
            ),
            401,
        )

    is_admin = True if user.role.role == "admin" else False

    access_token = create_access_token(
        identity={"username": username, "is_admin": is_admin, "user_id": user.id},
        fresh=True,
        expires_delta=app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    )

    access_jti = get_jti(encoded_token=access_token)

    redis_client.set(access_jti, "false", app.config["JWT_ACCESS_TOKEN_EXPIRES"] * 1.2)

    return (
        jsonify(
            access_token=access_token,
            username=username,
            is_admin=is_admin,
            user_id=user.id,
        ),
        200,
    )


@auth.route("/is_logged_in", methods=["POST"])
@jwt_required
def is_logged_in():
    identity = get_jwt_identity()
    jti = get_raw_jwt()["jti"]
    entry = redis_client.get(jti)

    if entry is None:
        return jsonify(is_logged_in=False), 200

    return (
        jsonify(
            is_logged_in=True,
            username=identity["username"],
            is_admin=identity["is_admin"],
        ),
        200,
    )


@auth.route("/logout", methods=["DELETE"])
@jwt_required
def logout():
    jti = get_raw_jwt()["jti"]
    redis_client.set(jti, "true", app.config["JWT_ACCESS_TOKEN_EXPIRES"] * 1.2)
    return jsonify(message="User logged out", type="LOGGED_OUT"), 200
