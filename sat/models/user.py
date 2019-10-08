from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from sat import db, login


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column('created_at', db.DateTime, default=db.func.now())
    last_modified = db.Column('last_modified', db.DateTime, default=db.func.now(), onupdate=db.func.utc_timestamp())

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return "<User {}>".format(self.username)
