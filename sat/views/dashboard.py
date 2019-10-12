import os

from flask import render_template, redirect, url_for, request
from flask_login import login_required, current_user

from . import views

from sat import db
from sat.forms import TranscriptionForm
from sat.models import Data, User


@views.route("/dashboard", methods=["GET"])
@login_required
def dashboard():
    message = "No audios found!"
    page = request.args.get("page", 1, type=int)
    active = request.args.get("active", "pending", type=str)

    if active == "pending":
        data = Data.query.filter_by(
            user_id=current_user.id, transcription=None
        ).order_by(Data.last_modified.desc())
    elif active == "completed":
        data = Data.query.filter(
            Data.user_id == current_user.id, Data.transcription.isnot(None)
        ).order_by(Data.last_modified.desc())
    elif active == "all":
        data = Data.query.filter(Data.user_id == current_user.id).order_by(
            Data.last_modified.desc()
        )

    paginated_data = data.paginate(page, 10, False)
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

    return render_template(
        "dashboard.html",
        message=message if len(audio_data) == 0 else None,
        title="Dashboard",
        audio_data=audio_data,
        next_url=next_url,
        prev_url=prev_url,
        page=page,
        active=active,
        total=paginated_data.total,
    )
