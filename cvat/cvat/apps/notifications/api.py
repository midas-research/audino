## Send Notification
from ..notifications.views import NotificationsViewSet
from ..notifications.serializers import (SendNotificationSerializer, FetchUserNotificationsSerializer, MarkNotificationAsViewedSerializer)


# Send notification to specified user
def SendNotificationToSingleUser(user_id, title, message, noti_type):
    viewset = NotificationsViewSet()
    send_notification_data_user = {
        "user" : f"{user_id}",
        "title" : f"{title}",
        "message" : f"{message}",
        "notification_type" : f"{noti_type}",
    }

    send_notification_serializer_user = SendNotificationSerializer(
        data = send_notification_data_user
    )

    if send_notification_serializer_user.is_valid():
        response = viewset.SendNotification(
            request = type(
                'Request',
                (
                    object,
                ),
                {
                    'data': send_notification_serializer_user.validated_data
                }
            )
        )

        return response

    return None


# Send notification to all the users of specified organizations
def SendNotificationToOrganisationUsers(org_id, title, message, noti_type):
    viewset = NotificationsViewSet()
    send_notification_data_org = {
        "org" : f"{org_id}",
        "title" : f"{title}",
        "message" : f"{message}",
        "notification_type" : f"{noti_type}",
    }

    send_notification_serializer_org = SendNotificationSerializer(
        data = send_notification_data_org
    )

    if send_notification_serializer_org.is_valid():
        response = viewset.SendNotification(
            request = type(
                'Request',
                (
                    object,
                ),
                {
                    'data': send_notification_serializer_org.validated_data
                }
            )
        )

        return response

    return None


# Fetch all Notifications of the specified user
def FetchUserNotifications(user_id, current_page, items_per_page):
    viewset = NotificationsViewSet()
    fetch_user_notifications_data = {
        "user": user_id,
        "current_page" : current_page,
        "items_per_page" : items_per_page
    }
    fetch_user_notifications_serializer = FetchUserNotificationsSerializer(
        data = fetch_user_notifications_data
    )

    if fetch_user_notifications_serializer.is_valid():
        response = viewset.FetchUserNotifications(
            request = type(
                'Request',
                (
                    object,
                ),
                {
                    'data' : fetch_user_notifications_serializer.validated_data
                }
            )
        )

        return response

    return None


# Mark user notification(s) as read
def MarkUserNotificationsAsRead(user_id, notification_ids = []):
    viewset = NotificationsViewSet()
    mark_notification_as_viewed_data = {
        "user": user_id,
        "notification_ids": notification_ids
    }
    mark_notification_as_viewed_serializer = MarkNotificationAsViewedSerializer(
        data = mark_notification_as_viewed_data
    )

    if mark_notification_as_viewed_serializer.is_valid():
        response = viewset.MarkNotificationAsViewed(
            request = type(
                'Request',
                (
                    object,
                ),
                {
                    'data' : mark_notification_as_viewed_serializer.validated_data
                }
            )
        )

        return response

    return None