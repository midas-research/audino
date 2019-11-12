from flask_wtf import FlaskForm
from wtforms import (
    StringField,
    PasswordField,
    BooleanField,
    SubmitField,
    TextAreaField,
    RadioField,
    SelectField,
    HiddenField,
)
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    email = StringField("email", validators=[DataRequired()])
    password = PasswordField("password", validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Sign In")


class TranscriptionForm(FlaskForm):
    start_time = StringField("Start Time")
    end_time = StringField("End Time")
    transcription = TextAreaField("Transcription")
    speaker = SelectField(
        "Speaker",
        choices=[("1", "Asha Worker"), ("2", "Doctor"), ("3", "Moderator")],
        default="1",
    )
    critical = SelectField("Critical", choices=[("1", "High"), ("2", "Low")], default="1")
    relevance = SelectField(
        "Relevance", choices=[("1", "Relevant"), ("2", "Irrelevant")], default="1"
    )
    topic = SelectField("Topic", default="1")
    other_topic = StringField("Other Topics")
    segmented_transcription = HiddenField("Segmented Transcription", default=[])
    marked_review = BooleanField("Mark for review")
    submit = SubmitField("Submit")
