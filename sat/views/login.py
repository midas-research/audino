from flask import render_template, flash, redirect, url_for

from sat.forms import LoginForm
from . import views

@views.route("/", methods=['GET', 'POST'])
@views.route("/index", methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        flash('Login requested for user {}, remember_me={}'.format(
            form.email.data, form.remember_me.data), 'success')
        return redirect(url_for('routes.dashboard'))

    return render_template("login.html", form=form)
