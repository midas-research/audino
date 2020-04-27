# import sqlalchemy as sa
# import uuid

# from flask import jsonify, flash, redirect, url_for, request
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from werkzeug.urls import url_parse

# from backend import app, db
# from backend.models import Label

# from . import api


# @api.route("/labels/", methods=["GET"])
# @jwt_required
# def fetch_all_labels():
#     try:
#         projects = Project.query.all()
#         response = list(
#             [
#                 {
#                     "project_id": project.id,
#                     "name": project.name,
#                     "api_key": project.api_key,
#                     "created_by": project.creator_user.username,
#                     "created_on": project.created_at.strftime("%B %d, %Y"),
#                 }
#                 for project in projects
#             ]
#         )
#     except Exception as e:
#         message = "Error fetching all projects"
#         app.logger.error(message)
#         app.logger.error(e)
#         return jsonify(message=message), 500

#     return jsonify(projects=response), 200
