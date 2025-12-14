# serializers.py
from rest_framework import serializers
from .models import *


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = ['id', 'title', 'message', 'notification_type', 'created_at']


class UserNotificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationStatus
        fields = ['is_read', 'read_at']


class UserNotificationDetailSerializer(serializers.ModelSerializer):
    status = UserNotificationStatusSerializer(source='notificationstatus_set.first')

    class Meta:
        model = Notifications
        fields = ['id', 'title', 'message', 'notification_type', 'created_at', 'status']


class AddNotificationSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    message = serializers.CharField()
    notification_type = serializers.CharField(max_length=50)


class SendNotificationSerializer(serializers.Serializer):
    user = serializers.IntegerField(required=False)
    org = serializers.IntegerField(required=False)
    title = serializers.CharField()
    message = serializers.CharField()
    notification_type = serializers.CharField(max_length=50)


class MarkNotificationAsViewedSerializer(serializers.Serializer):
    user = serializers.IntegerField()
    notification_ids = serializers.ListField(
        child=serializers.IntegerField()
    )


class FetchUserNotificationsSerializer(serializers.Serializer):
    user = serializers.IntegerField()
    current_page = serializers.IntegerField()
    items_per_page = serializers.IntegerField()