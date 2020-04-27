import ast

from flask import render_template, redirect, url_for, request, abort
from flask_login import login_required, current_user

from . import views

from backend import db
from backend.forms import TranscriptionForm
from backend.models import Data, User, Transcription


@views.route("/annotation", methods=["GET", "POST"])
@login_required
def annotation():
    file_id = request.args.get("file", None, type=int)

    if file_id is None:
        return render_template(
            "annotation.html", title="Annotation", message="No audio file passed"
        )

    form = TranscriptionForm()

    data = Data.query.filter_by(id=file_id, user_id=current_user.id).first()

    if not data:
        return render_template(
            "annotation.html",
            title="Annotation",
            message="No such audio exist in database",
        )

    if form.validate_on_submit():
        segmented_transcription = ast.literal_eval(form.segmented_transcription.data)
        marked_review = form.marked_review.data

        transcriptions = list(
            [
                Transcription(
                    start_time=st["start"],
                    end_time=st["end"],
                    file_id=data.id,
                    transcription=st["data"]["transcription"]
                    if "transcription" in st["data"]
                    else "",
                )
                for st in segmented_transcription
            ]
        )

        try:
            current_transcriptions = Transcription.query.filter_by(file_id=data.id)

            for st in current_transcriptions:
                st.is_deleted = True
                db.session.add(st)

            for st in transcriptions:
                db.session.add(st)

            data.update_marked_review(marked_review)

            db.session.commit()
        except Exception as e:
            print(e)
            db.session.rollback()
            abort(500)

        return redirect(url_for("routes.dashboard"))

    segmented_transcription = Transcription.query.filter_by(file_id=data.id).all()

    form.segmented_transcription.data = [
        {
            "start": st.start_time,
            "end": st.end_time,
            "data": {"transcription": st.transcription},
        }
        for st in segmented_transcription
    ]
    form.marked_review.data = data.marked_review

    return render_template(
        "annotation.html", title="Annotation", form=form, data=data, file_id=file_id
    )
