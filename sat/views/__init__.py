from flask import Blueprint

views = Blueprint('routes', __name__)

from .login import *
from .dashboard import *
