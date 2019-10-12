from flask import render_template, redirect, url_for, request
from flask_login import login_required, current_user

from . import views

from sat import db
from sat.forms import TranscriptionForm
from sat.models import Data, User


@views.route("/annotation", methods=["GET", "POST"])
@login_required
def annotation():
    file_id = request.args.get("file", None, type=int)

    if file_id is None:
        return render_template(
            "annotation.html",
            title="Annotation",
            message="No audio file passed",
        )

    form = TranscriptionForm()

    data = Data.query.filter_by(id=file_id, user_id=current_user.id).first()

    if form.validate_on_submit():
        transcription = form.transcription.data
        marked_review = form.marked_review.data
        

        data.update_transcript(transcription)
        data.update_marked_review(marked_review)
        
        db.session.commit()

        return redirect(url_for("routes.dashboard"))

    if not data:
        return render_template(
            "annotation.html",
            title="Annotation",
            message="No such audio exist in database",
        )

    form.transcription.data = data.transcription if data.transcription is not None else ''
    form.marked_review.data = data.marked_review

    return render_template("annotation.html", title="Annotation", form=form, data=data, file_id=file_id)
