from django.db.models import *

from django.contrib.auth.models import User
from ..organizations.models import *
# Create your models here.


class Notifications(Model):
    id = AutoField(primary_key=True)
    title = CharField(max_length=255)
    message = TextField()
    extra_data = JSONField(blank=True, null=True)
    created_at = DateTimeField(auto_now_add=True)
    notification_type = CharField(max_length=50, choices=[
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('success', 'Success'),
        ('error', 'Error')
    ])

    def __str__(self):
        return f"Notification - {self.title}"


class NotificationStatus(Model):
    notification = ForeignKey(Notifications, on_delete=CASCADE)
    user = ForeignKey(User, on_delete=CASCADE)
    is_read = BooleanField(default=False)
    read_at = DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('notification', 'user')

    def __str__(self):
        return f"Status for {self.user.username} - {self.notification.title}"