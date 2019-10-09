from flask import render_template, flash, redirect, url_for, request
from flask_login import current_user, login_user
from werkzeug.urls import url_parse


from sat.models import User
from sat.forms import LoginForm
from . import views


@views.route("/", methods=["GET", "POST"])
@views.route("/index", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("routes.dashboard"))

    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()

        if user is None or not user.check_password(form.password.data):
            flash("Invalid username or password", "danger")
            return redirect(url_for("routes.login"))
        flash(f"Logged into {form.email.data}", "success")
        login_user(user, remember=form.remember_me.data)

        next_page = request.args.get("next")
        if not next_page or url_parse(next_page).netloc != "":
            next_page = url_for("routes.dashboard")

        return redirect(next_page)

    return render_template("login.html", form=form)

