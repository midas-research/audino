from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField, HiddenField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    email = StringField('email', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')


class TranscriptionForm(FlaskForm):
    transcription = TextAreaField('Transcription', validators=[DataRequired()])
    marked_review = BooleanField('Mark for review')
    submit = SubmitField('Submit')
