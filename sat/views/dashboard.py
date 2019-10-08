from flask import render_template

from . import views

@views.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", title='Dashboard')
