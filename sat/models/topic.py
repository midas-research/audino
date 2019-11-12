
from sat import db


class Topic(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(200), unique=True, nullable=False)
