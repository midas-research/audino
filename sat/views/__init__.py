from flask import Blueprint

views = Blueprint('routes', __name__)

from .base import *
from .errors import *
from .login import *
from .dashboard import *
