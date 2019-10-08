from flask import render_template
from flask_login import login_required

from . import views
from sat.forms import TranscriptionForm


@views.route("/dashboard")
@login_required
def dashboard():
    form = TranscriptionForm()
    form.file_name.data = 'XYZ'
    return render_template("dashboard.html", title='Dashboard', form=form)
