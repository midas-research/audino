import ast

from flask import render_template, redirect, url_for, request, abort
from flask_login import login_required, current_user

from . import views

from sat import db
from sat.forms import TranscriptionForm
from sat.models import Data, User, Transcription, Topic


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
    topics = Topic.query.all()

    topic_choices = list()
    other_topic = tuple()

    for topic in topics:
        topic_choices.append((str(topic.id), topic.topic))
        if topic.topic == 'Other':
            other_topic = (str(topic.id), topic.topic)

    form.topic.choices = topic_choices

    if not data:
        return render_template(
            "annotation.html",
            title="Annotation",
            message="No such audio exist in database",
        )

    if form.validate_on_submit():
        segmented_transcription = ast.literal_eval(form.segmented_transcription.data)
        marked_review = form.marked_review.data

        transcriptions = list()
        
        for st in segmented_transcription:
            segmented_data = st['data']
            if segmented_data:
                if ('topic' in segmented_data and segmented_data['topic'] == other_topic[0]):
                    new_topic_val = str(segmented_data['other_topic']).strip().capitalize()
                    if new_topic_val != '':
                        try:
                            new_topic = Topic(topic=new_topic_val)
                            db.session.add(new_topic)
                            db.session.commit()
                            db.session.refresh(new_topic)
                            segmented_data['topic'] = new_topic.id
                        except Exception as e:
                            print(e)
                            db.session.rollback()

        for st in segmented_transcription:
            if st['data']:
                transcript = Transcription(
                    start_time=st["start"],
                    end_time=st["end"],
                    file_id=data.id,
                    transcription=st["data"]["transcription"]
                    if "transcription" in st["data"]
                    else "",
                    topic=st['data']['topic']
                )

                transcriptions.append(transcript)

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
            "data": {
                "transcription": st.transcription,
                "topic": st.topic,
            },
        }
        for st in segmented_transcription
    ]
    form.marked_review.data = data.marked_review

    return render_template(
        "annotation.html", title="Annotation", form=form, data=data, file_id=file_id
    )
