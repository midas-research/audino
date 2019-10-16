import os

from flask import render_template, redirect, url_for, request
from flask_login import login_required, current_user
from sqlalchemy import or_

from . import views

from sat import db
from sat.forms import TranscriptionForm
from sat.models import Data, User, Transcription


@views.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    message = "No audios found!"
    page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "pending", type=str)

    data = {}

    transcriptions = (
        db.session.query(Transcription.file_id)
        .filter(Transcription.is_deleted == False)
        .subquery()
    )

    data["pending"] = (
        db.session.query(Data)
        .filter(Data.user_id == current_user.id)
        .filter(Data.id.notin_(transcriptions))
        .distinct()
        .order_by(Data.last_modified.desc())
    )

    data["completed"] = (
        db.session.query(Data)
        .filter(Data.user_id == current_user.id)
        .filter(Data.id.in_(transcriptions))
        .distinct()
        .order_by(Data.last_modified.desc())
    )

    data["all"] = Data.query.filter(Data.user_id == current_user.id).order_by(
        Data.last_modified.desc()
    )

    data["marked_review"] = Data.query.filter(
        Data.user_id == current_user.id, Data.marked_review == True
    ).order_by(Data.last_modified.desc())

    paginated_data = data[active].paginate(page, 10, False)

    next_url = (
        url_for("routes.dashboard", page=paginated_data.next_num, active=active)
        if paginated_data.has_next
        else None
    )
    prev_url = (
        url_for("routes.dashboard", page=paginated_data.prev_num, active=active)
        if paginated_data.has_prev
        else None
    )

    audio_data = [
        {
            "file_name": os.path.basename(audio.file),
            "id": audio.id,
            "marked_review": audio.marked_review,
        }
        for audio in paginated_data.items
    ]

    count_data = {key: value.count() for key, value in data.items()}

    return render_template(
        "dashboard.html",
        message=message if len(audio_data) == 0 else None,
        title="Dashboard",
        audio_data=audio_data,
        count_data=count_data,
        next_url=next_url,
        prev_url=prev_url,
        page=page,
        active=active,
        total=paginated_data.total,
    )
