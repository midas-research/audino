from flask_sqlalchemy import BaseQuery

from sat import db, login


class QueryWithSoftDelete(BaseQuery):
    _with_deleted = False

    def __new__(cls, *args, **kwargs):
        obj = super(QueryWithSoftDelete, cls).__new__(cls)
        obj._with_deleted = kwargs.pop("_with_deleted", False)
        if len(args) > 0:
            super(QueryWithSoftDelete, obj).__init__(*args, **kwargs)
            return obj.filter_by(is_deleted=False) if not obj._with_deleted else obj
        return obj

    def __init__(self, *args, **kwargs):
        pass

    def with_deleted(self):
        return self.__class__(
            db.class_mapper(self._mapper_zero().class_),
            session=db.session(),
            _with_deleted=True,
        )

    def _get(self, *args, **kwargs):
        return super(QueryWithSoftDelete, self).get(*args, **kwargs)

    def get(self, *args, **kwargs):
        obj = self.with_deleted()._get(*args, **kwargs)
        return obj if obj is None or self._with_deleted or not obj.is_deleted else None


class Transcription(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    file_id = db.Column("file_id", db.Integer, db.ForeignKey("data.id"), nullable=False)
    transcription = db.Column("transcription", db.Text(), nullable=False)

    start_time = db.Column("start_time", db.Float, nullable=False)
    end_time = db.Column("end_time", db.Float, nullable=False)

    topic = db.Column("topic", db.Integer, db.ForeignKey("topic.id"), nullable=False)

    is_deleted = db.Column("is_deleted", db.Boolean(), nullable=False, default=False)

    created_at = db.Column(
        "created_at", db.DateTime, nullable=False, default=db.func.now()
    )
    last_modified = db.Column(
        "last_modified",
        db.DateTime,
        nullable=False,
        default=db.func.now(),
        onupdate=db.func.utc_timestamp(),
    )

    query_class = QueryWithSoftDelete

