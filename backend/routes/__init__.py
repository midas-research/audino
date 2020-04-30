from flask import Blueprint

auth = Blueprint("auth", __name__, url_prefix="/auth")
api = Blueprint("api", __name__, url_prefix="/api")

from .login import *
from .users import *
from .projects import *
from .labels import *
from .current_user import *
from .data import *
from .audios import *
