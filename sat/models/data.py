from sat import db, login


class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    file = db.Column("file", db.String(2000), nullable=False)
    transcription = db.Column("transcription", db.Text(), nullable=True)

    user_id = db.Column(
        "user_id",
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False,
    )

    created_at = db.Column("created_at", db.DateTime, nullable=False, default=db.func.now())
    last_modified = db.Column(
        "last_modified",
        db.DateTime,
        nullable=False,
        default=db.func.now(),
        onupdate=db.func.utc_timestamp(),
    )

    marked_review = db.Column("marked_review", db.Boolean, nullable=False, default=False)

    __table_args__ = (db.UniqueConstraint('file', 'user_id', name='_file_user_id_uc'),)

    def update_transcript(self, transcription):
        self.transcription = transcription

    def update_marked_review(self, marked_review):
        self.marked_review = marked_review
