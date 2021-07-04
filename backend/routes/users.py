import sqlalchemy as sa

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse

from backend import app, db
from backend.models import User

from . import api


@api.route("/users", methods=["POST"])
@jwt_required
def create_user():
    # TODO: Make jwt user id based to expire user session if permissions are changed
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    username = request.json.get("username", None)
    password = request.json.get("password", None)
    role_id = request.json.get("role", None)

    if not username:
        return (
            jsonify(message="Please provide your username!", type="USERNAME_MISSING"),
            400,
        )
    if not password:
        return (
            jsonify(message="Please provide your password!", type="PASSWORD_MISSING"),
            400,
        )

    if not role_id:
        return (jsonify(message="Please provide your role!", type="ROLE_MISSING"), 400)

    if role_id not in ["1", "2"]:
        return (
            jsonify(message="Please assign correct role!", type="ROLE_INCORRECT"),
            400,
        )

    try:
        user = User(username=username, role_id=role_id)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"User {username} already exists!")
            return (jsonify(message="User already exists!", type="DUPLICATE_USER"), 409)
        app.logger.error("Error creating user")
        app.logger.error(e)
        return jsonify(message="Error creating user!"), 500

    return jsonify(user_id=user.id, message="User has been created!"), 201


@api.route("/rmusers", methods=["POST"])
@jwt_required
def remove_user():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False
    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    try:
        del_user_id = request.json['rmuserId']
        del_user = User.query.filter_by(id=del_user_id).first()
        if del_user.id == request_user.id:
            app.logger.error("Cannot delete self")
            return jsonify(message="Cannot delete self!"), 500

        if del_user.is_deleted:
            app.logger.error("This user had already been deleted")
            return jsonify(message="User not found"), 404

        del_user.is_deleted = sa.func.now()
        db.session.commit()
    except Exception as e:
        app.logger.error("Error deleting user")
        app.logger.error(e)
        return jsonify(message="Error deleting user!"), 500

    return jsonify(user_id=request_user.id, name=request_user.username, message="User has been deleted!"), 201



@api.route("/users/<int:user_id>", methods=["GET"])
@jwt_required
def fetch_user(user_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        user = User.query.get(user_id)
        # user = User.query.filter(User.id == user_id)
        # user = User.query.filter(User.id == user_id, User.is_deleted != None)

    except Exception as e:
        app.logger.error(f"No user exists with user_id: {user_id}")
        app.logger.error(e)
        return (
            jsonify(message="No user exists with given user_id", user_id=user_id),
            404,
        )

    return (
        jsonify(
            user_id=user.id,
            username=user.username,
            role_id=user.role.id,
            role=user.role.role,
        ),
        200,
    )


@api.route("/users/<int:user_id>", methods=["PATCH"])
@jwt_required
def update_user(user_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    role_id = request.json.get("role", None)

    if not role_id:
        return (jsonify(message="Please provide your role!", type="ROLE_MISSING"), 400)

    role_id = int(role_id)
    # TODO: Make sure these ids exist in database ie. fetch them from database and check
    if role_id not in [1, 2]:
        return (
            jsonify(message="Please assign correct role!", type="ROLE_INCORRECT"),
            400,
        )

    try:
        users = db.session.query(User).filter_by(role_id=1).all()

        if len(users) == 1 and users[0].id == user_id and role_id == 2:
            return jsonify(message="Atleast one admin should exist"), 400

        user = User.query.get(user_id)
        user.set_role(role_id)
        db.session.commit()
    except Exception as e:
        app.logger.error("No user found")
        app.logger.error(e)
        return jsonify(message="No user found!"), 404

    return (
        jsonify(
            username=user.username,
            role=user.role.role,
            role_id=user.role.id,
            message="User has been updated!",
        ),
        200,
    )


@api.route("/users", methods=["GET"])
@jwt_required
def fetch_all_users():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access"), 401

    try:
        users = User.query.all()
        # users = User.query.not_deleted().all()
        response = list(
            [
                {
                    "user_id": user.id,
                    "username": user.username,
                    "role": user.role.role.title(),
                    "created_on": user.created_at.strftime("%B %d, %Y"),
                }
                for user in users
            ]
        )
    except Exception as e:
        message = "Error fetching all users"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return jsonify(users=response), 200
