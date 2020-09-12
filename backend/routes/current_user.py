import sqlalchemy as sa
import uuid

from flask import jsonify, flash, redirect, url_for, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.urls import url_parse

from backend import app, db
from backend.models import Project, User, Data, Segmentation

from . import api


@api.route("/current_user/projects", methods=["GET"])
@jwt_required
def fetch_current_user_projects():
    identity = get_jwt_identity()

    try:
        request_user = User.query.filter_by(username=identity["username"]).first()
        response = list(
            [
                {
                    "project_id": project.id,
                    "name": project.name,
                    "created_by": project.creator_user.username,
                    "created_on": project.created_at.strftime("%B %d, %Y"),
                }
                for project in request_user.projects
            ]
        )
    except Exception as e:
        message = "Error fetching all projects"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return jsonify(projects=response), 200


@api.route("/current_user/projects/<int:project_id>/data", methods=["GET"])
@jwt_required
def fetch_data_for_project(project_id):
    identity = get_jwt_identity()

    page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "pending", type=str)

    try:
        request_user = User.query.filter_by(username=identity["username"]).first()
        project = Project.query.get(project_id)

        if request_user not in project.users:
            return jsonify(message="Unauthorized access!"), 401

        segmentations = db.session.query(Segmentation.data_id).distinct().subquery()

        data = {}

        data["pending"] = (
            db.session.query(Data)
            .filter(Data.is_deleted == None)
            .filter(Data.assigned_user_id == request_user.id)
            .filter(Data.project_id == project_id)
            .filter(Data.id.notin_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["completed"] = (
            db.session.query(Data)
            .filter(Data.is_deleted == None)
            .filter(Data.assigned_user_id == request_user.id)
            .filter(Data.project_id == project_id)
            .filter(Data.id.in_(segmentations))
            .distinct()
            .order_by(Data.last_modified.desc())
        )

        data["marked_review"] = Data.query.filter_by(
            assigned_user_id=request_user.id,
            is_deleted=None,
            project_id=project_id,
            is_marked_for_review=True,
        ).order_by(Data.last_modified.desc())

        data["all"] = Data.query.filter_by(
            assigned_user_id=request_user.id, project_id=project_id, is_deleted=None
        ).order_by(Data.last_modified.desc())

        paginated_data = data[active].paginate(page, 10, False)

        next_page = paginated_data.next_num if paginated_data.has_next else None
        prev_page = paginated_data.prev_num if paginated_data.has_prev else None
        response = list(
            [
                {
                    "data_id": data_point.id,
                    "filename": data_point.filename,
                    "original_filename": data_point.original_filename,
                    "created_on": data_point.created_at.strftime("%B %d, %Y"),
                    "reference_transcription": data_point.reference_transcription,
                    "is_marked_for_review": data_point.is_marked_for_review,
                    "number_of_segmentations": len(data_point.segmentations),
                }
                for data_point in paginated_data.items
            ]
        )
        count_data = {key: value.count() for key, value in data.items()}
    except Exception as e:
        message = "Error fetching all data points"
        app.logger.error(message)
        app.logger.error(e)
        return jsonify(message=message), 500

    return (
        jsonify(
            data=response,
            count=count_data,
            next_page=next_page,
            prev_page=prev_page,
            page=page,
            active=active,
        ),
        200,
    )
