from sat import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    created_at = db.Column('created_at', db.DateTime, default=db.func.now())
    last_modified = db.Column('last_modified', db.DateTime, onupdate=db.func.utc_timestamp())

    def __repr__(self):
        return "<User {}>".format(self.username)
