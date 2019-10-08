from flask import redirect, url_for
from flask_login import logout_user

from . import views


@views.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("routes.login"))
