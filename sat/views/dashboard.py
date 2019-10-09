from flask import render_template, session, redirect, url_for
from flask_login import login_required, current_user

from . import views

from sat import db
from sat.forms import TranscriptionForm
from sat.models import Data, User


@views.route("/dashboard", methods=["GET", "POST"])
@login_required
def dashboard():
    form = TranscriptionForm()

    if form.validate_on_submit():
        file = session["file"]
        transcription = form.transcription.data

        data = Data.query.filter_by(file=file, user_id=current_user.id).first()
        data.update_transcript(transcription)
        db.session.commit()

        return redirect(url_for("routes.dashboard"))

    data = Data.query.filter_by(user_id=current_user.id, transcription=None).first()

    if not data:
        return render_template(
            "dashboard.html",
            title="Dashboard",
            message="No audios currently assigned to you",
        )

    if "file" in session and (session["file"] != data.file):
        session["file"] = data.file
    if "file" not in session:
        session["file"] = data.file
    print(session["file"])
    return render_template("dashboard.html", title="Dashboard", form=form)
