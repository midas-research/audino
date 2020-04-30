import sqlalchemy as sa
import uuid

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse

from backend import app, db
from backend.models import Project, User, Label, Data

from . import api


def generate_api_key():
    return uuid.uuid4().hex


@api.route("/projects", methods=["POST"])
@jwt_required
def create_project():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    name = request.json.get("name", None)

    if not name:
        return (
            jsonify(
                message="Please provide a project name!", type="PROJECT_NAME_MISSING"
            ),
            400,
        )

    api_key = generate_api_key()

    try:
        project = Project(name=name, api_key=api_key, creator_user_id=request_user.id)
        db.session.add(project)
        db.session.commit()
        db.session.refresh(project)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"Project {name} already exists!")
            return (
                jsonify(message="Project already exists!", type="DUPLICATE_PROJECT"),
                409,
            )
        app.logger.error("Error creating project")
        app.logger.error(e)
        return jsonify(message="Error creating project!"), 500

    return jsonify(project_id=project.id, message="Project has been created!"), 201


@api.route("/projects", methods=["GET"])
@jwt_required
def fetch_all_projects():
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401
    try:
        projects = Project.query.all()
        response = list(
            [
                {
                    "project_id": project.id,
                    "name": project.name,
                    "api_key": project.api_key,
                    "created_by": project.creator_user.username,
                    "created_on": project.created_at.strftime("%B %d, %Y"),
                }
                for project in projects
            ]
        )
    except Exception as e:
        message = "Error fetching all projects"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return jsonify(projects=response), 200


@api.route("/projects/<int:project_id>", methods=["GET"])
@jwt_required
def fetch_project(project_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        project = Project.query.get(project_id)
        users = [
            {"user_id": user.id, "username": user.username} for user in project.users
        ]
        labels = [
            {
                "label_id": label.id,
                "name": label.name,
                "type": label.label_type.type,
                "created_on": label.created_at.strftime("%B %d, %Y"),
            }
            for label in project.labels
        ]
    except Exception as e:
        app.logger.error(f"No project exists with Project ID: {project_id}")
        app.logger.error(e)
        return (
            jsonify(
                message="No project exists with given project_id", project_id=project_id
            ),
            404,
        )

    return (
        jsonify(
            project_id=project.id,
            name=project.name,
            users=users,
            labels=labels,
            api_key=project.api_key,
            created_by=project.creator_user.username,
            created_on=project.created_at.strftime("%B %d, %Y"),
        ),
        200,
    )


@api.route("/projects/<int:project_id>/users", methods=["PATCH"])
@jwt_required
def update_project_users(project_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    users = request.json.get("users", None)

    if not users or type(users) != list:
        return (
            jsonify(message="Params `user` missing in request", type="USERS_MISSING"),
            400,
        )

    try:
        project = Project.query.get(project_id)
        # TODO: Decide whether to give creator of project access
        # project.users.append(request_user)
        for user in project.users:
            if user.id not in users:
                project.users.remove(user)

        for user_id in users:
            user = User.query.get(user_id)
            if user not in project.users:
                project.users.append(user)

        db.session.add(project)
        db.session.commit()
    except Exception as e:
        app.logger.error(f"Error adding users to project: {project_id}")
        app.logger.error(e)
        return (
            jsonify(
                message=f"Error adding users to project: {project_id}",
                type="USERS_ASSIGNMENT_FAILED",
            ),
            500,
        )

    return (
        jsonify(
            project_id=project.id,
            message=f"Users assigned to project: {project.name}",
            type="USERS_ASSIGNED_TO_PROJECT",
        ),
        201,
    )


@api.route("/projects/<int:project_id>/labels", methods=["POST"])
@jwt_required
def add_label_to_project(project_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    label_name = request.json.get("name", None)
    label_type_id = request.json.get("type", None)

    if not label_name:
        return (
            jsonify(message="Please provide a label name!", type="LABEL_NAME_MISSING"),
            400,
        )

    if not label_type_id:
        return (
            jsonify(message="Please provide a label type!", type="LABEL_TYPE_MISSING"),
            400,
        )

    label_type_id = int(label_type_id)
    # TODO: Make sure these ids exist in database ie. fetch them from database and check
    if label_type_id not in [1, 2]:
        return (
            jsonify(
                message="Please assign correct label type!", type="LABEL_TYPE_INCORRECT"
            ),
            400,
        )

    try:
        project = Project.query.get(project_id)
        label = Label(name=label_name, type_id=label_type_id)
        project.labels.append(label)
        db.session.add(project)
        db.session.commit()
        db.session.refresh(label)
    except Exception as e:
        if type(e) == sa.exc.IntegrityError:
            app.logger.info(f"Label: {label_name} already exists!")
            return (
                jsonify(
                    message=f"Label: {label_name} already exists!",
                    type="DUPLICATE_LABEL",
                ),
                409,
            )
        app.logger.error(f"Error adding label to project: {project_id}")
        app.logger.error(e)
        return (
            jsonify(
                message=f"Error adding label to project: {project_id}",
                type="LABEL_CREATION_FAILED",
            ),
            500,
        )

    return (
        jsonify(
            project_id=project.id,
            label_id=label.id,
            message=f"Label assigned to project: {project.name}",
            type="LABEL_ASSIGNED_TO_PROJECT",
        ),
        201,
    )


@api.route("/projects/<int:project_id>/labels/<int:label_id>", methods=["GET"])
@jwt_required
def get_label_for_project(project_id, label_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    try:
        label = Label.query.filter_by(id=label_id, project_id=project_id).first()
    except Exception as e:
        app.logger.error(
            f"No label exists with Label ID: {label_id} Project ID: {project_id}"
        )
        app.logger.error(e)
        return (
            jsonify(
                message=f"No label exists with Label ID: {label_id} Project ID: {project_id}"
            ),
            404,
        )

    return (
        jsonify(
            project_id=project_id,
            label_id=label.id,
            label_name=label.name,
            label_type_id=label.label_type.id,
            label_type=label.label_type.type,
            created_on=label.created_at.strftime("%B %d, %Y"),
        ),
        200,
    )


@api.route("/projects/<int:project_id>/labels/<int:label_id>", methods=["PATCH"])
@jwt_required
def update_label_for_project(project_id, label_id):
    identity = get_jwt_identity()
    request_user = User.query.filter_by(username=identity["username"]).first()
    is_admin = True if request_user.role.role == "admin" else False

    if is_admin == False:
        return jsonify(message="Unauthorized access!"), 401

    if not request.is_json:
        return jsonify(message="Missing JSON in request"), 400

    label_type_id = request.json.get("type", None)

    if not label_type_id:
        return (
            jsonify(
                message="Please provide valid label type!", type="LABEL_TYPE_MISSING"
            ),
            400,
        )

    label_type_id = int(label_type_id)
    # TODO: Make sure these ids exist in database ie. fetch them from database and check
    if label_type_id not in [1, 2]:
        return (
            jsonify(
                message="Please assign correct label type!", type="LABEL_TYPE_INCORRECT"
            ),
            400,
        )

    try:
        label = Label.query.filter_by(id=label_id, project_id=project_id).first()
        label.set_label_type(label_type_id)
        db.session.commit()
    except Exception as e:
        # TODO: Check for errors here
        app.logger.error(
            f"No label exists with Label ID: {label_id} Project ID: {project_id}"
        )
        app.logger.error(e)
        return (
            jsonify(
                message=f"No label exists with Label ID: {label_id} Project ID: {project_id}"
            ),
            404,
        )

    return (
        jsonify(
            project_id=project_id,
            label_id=label.id,
            label_name=label.name,
            label_type_id=label.label_type.id,
            label_type=label.label_type.type,
            created_on=label.created_at.strftime("%B %d, %Y"),
        ),
        200,
    )


@api.route("/projects/<int:project_id>/labels", methods=["GET"])
@jwt_required
def get_labels_for_project(project_id):
    identity = get_jwt_identity()

    try:
        request_user = User.query.filter_by(username=identity["username"]).first()
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        labels = project.labels

        response = {}
        for label in labels:
            values = label.label_values
            type = label.label_type.type

            values = [{"value_id": value.id, "value": value.value} for value in values]

            response[label.name] = {
                "type": type,
                "label_id": label.id,
                "values": values,
            }

    except Exception as e:
        app.logger.error("Error fetching all labels")
        app.logger.error(e)
        return (jsonify(message="Error fetching all labels"), 404)

    return (jsonify(response), 200)


@api.route("/projects/<int:project_id>/data/<int:data_id>", methods=["GET"])
@jwt_required
def get_segmentations_for_data(project_id, data_id):
    identity = get_jwt_identity()

    try:
        request_user = User.query.filter_by(username=identity["username"]).first()
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        data = Data.query.filter_by(id=data_id, project_id=project_id).first()

        segmentations = []
        for segment in data.segmentations:
            resp = {
                "start_time": segment.start_time,
                "end_time": segment.end_time,
                "transcription": segment.transcription,
            }

            values = dict(
                {
                    value.label.name: {
                        "label_value_id": value.id,
                        "label_value": value.value,
                    }
                    for value in segment.values
                }
            )

            resp["annotations"] = values

            segmentations.append(resp)

        response = {
            "filename": data.filename,
            "original_filename": data.original_filename,
            "reference_transcription": data.reference_transcription,
            "is_marked_for_review": data.is_marked_for_review,
            "segmentations": segmentations,
        }

    except Exception as e:
        app.logger.error("Error fetching datapoint with given id")
        app.logger.error(e)
        return (jsonify(message="Error fetching datapoint with given id"), 404)

    return (jsonify(response), 200)
