from django.shortcuts import render
from django.utils import timezone
from django.core.paginator import EmptyPage

from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import *
from .serializers import *

import json
import traceback


## Pagination
class CustomPagination(PageNumberPagination):
    def paginate_queryset(self, queryset, request, view = None):
        page_size = request.data.get('items_per_page', 10)
        page_number = request.data.get('current_page', 1)
        self.page_size = page_size
        paginator = self.django_paginator_class(queryset, page_size)

        try:
            self.page = paginator.page(page_number)
        except EmptyPage:
            return None

        if int(page_number) > paginator.num_pages:
            return None

        return list(self.page)


## Notification
class NotificationsViewSet(viewsets.ViewSet):
    isAuthorized = True

    def AddNotification(self, data):
        serializer = AddNotificationSerializer(data=data)
        if serializer.is_valid():
            try:
                notification = Notifications.objects.create(
                    title=serializer.validated_data['title'],
                    message=serializer.validated_data['message'],
                    notification_type=serializer.validated_data['notification_type']
                )
                return Response(
                    {
                        "success": True,
                        "message": "Notification saved successfully.",
                        "data": {
                            "notification": UserNotificationDetailSerializer(notification).data
                        },
                        "error": None
                    }
                )
            except Exception as e:
                error = traceback.format_exc()
                return Response(
                    {
                        "success": False,
                        "message": "An error occurred while saving notification.",
                        "data": {},
                        "error": error
                    },
                    status = status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {
                    "success": False,
                    "message": "Invalid data.",
                    "data": serializer.errors,
                    "error": None
                },
                status = status.HTTP_400_BAD_REQUEST
            )

    def SendNotification(self, request: Request):
        try:
            data = request.data  # Use request.data instead of json.loads(request.body)
            serializer = SendNotificationSerializer(data=data)
            if serializer.is_valid():
                response = self.AddNotification(serializer.validated_data)
                if not response.data["success"]:
                    return response

                notification = response.data["data"]["notification"]

                if "user" in serializer.validated_data:
                    user = serializer.validated_data["user"]
                    response = self.SendUserNotifications(notification, user)
                elif "org" in serializer.validated_data:
                    response = self.SendOrganizationNotifications(notification, serializer.validated_data)

                return response
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid request data.",
                        "data": serializer.errors,
                        "error": None
                    },
                    status = status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            error = traceback.format_exc()
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while sending notification.",
                    "data": {},
                    "error": error
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def SendUserNotifications(self, notification, user_id):
        try:
            user = User.objects.get(id=user_id)
            notification = Notifications.objects.get(id=notification.get("id"))
            NotificationStatus.objects.get_or_create(
                notification=notification,
                user=user,
                defaults={'is_read': False}
            )
            return Response(
                {
                    "success": True,
                    "message": "Notification sent successfully.",
                    "data": {},
                    "error": None
                },
                status = status.HTTP_201_CREATED
            )
        except User.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": f"User with id {user_id} does not exist.",
                    "data": {},
                    "error": None
                },
                status = status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error = traceback.format_exc()
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while sending user notification.",
                    "data": {},
                    "error": error
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def SendOrganizationNotifications(self, notification, data):
        try:
            organization = Organization.objects.get(id=data["org"])
            members = organization.members.filter(is_active=True)
            errors = []

            for member in members:
                user = member.user
                response = self.SendUserNotifications(notification, user.id)
                if not response.data.get("success"):
                    errors.append(f"Error occurred while sending notification to user ({user.username}). Error: {response.data.get('error')}")

            if not errors:
                return Response(
                    {
                        "success": True,
                        "message": "Notifications sent successfully.",
                        "data": {},
                        "error": None
                    },
                    status = status.HTTP_200_OK
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Unable to send notifications to one or more users.",
                        "data": {},
                        "error": errors
                    },
                    status = status.HTTP_504_GATEWAY_TIMEOUT
                )
        except Organization.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": f"Organization with id {data['org']} does not exist.",
                    "data": {},
                    "error": None
                },
                status = status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            error = traceback.format_exc()
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while sending organization notifications.",
                    "data": {},
                    "error": error
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def FetchUserNotifications(self, request: Request):
        try:
            data = request.data
            serializer = FetchUserNotificationsSerializer(data = data)

            if serializer.is_valid():
                user_id = serializer.validated_data["user"]
                notifications_status = NotificationStatus.objects.filter(user_id=user_id).order_by('-notification__created_at')
                unread_count = notifications_status.filter(is_read=False).count()

                # Set up pagination
                paginator = CustomPagination()
                paginated_notifications = paginator.paginate_queryset(notifications_status, request)

                if paginated_notifications is None:
                    return Response(
                        {
                            "success": True,
                            "message": "No notifications available on this page.",
                            "data": {
                                "unread" : 0,
                                "notifications": []
                            },
                            "error": None
                        },
                        status = status.HTTP_200_OK
                    )

                serialized_notifications = [UserNotificationDetailSerializer(noti_status.notification).data for noti_status in paginated_notifications]

                return Response(
                    {
                        "success": True,
                        "message": "User notifications fetched successfully.",
                        "data": {
                            "unread" : unread_count,
                            "notifications": serialized_notifications
                        },
                        "error": None
                    },
                    status = status.HTTP_200_OK
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid request data.",
                        "data": serializer.errors,
                        "error": None
                    },
                    status = status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            error = traceback.format_exc()
            print(error)
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while fetching notifications.",
                    "data": {},
                    "error": error
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def MarkNotificationAsViewed(self, request: Request):
        try:
            data = request.data  # Use request.data instead of json.loads(request.body)
            serializer = MarkNotificationAsViewedSerializer(data=data)
            if serializer.is_valid():
                user_id = serializer.validated_data["user"]
                notification_ids = serializer.validated_data["notification_ids"]

                notifications_status = NotificationStatus.objects.filter(notification_id__in=notification_ids, user_id=user_id)
                updated_count = notifications_status.update(is_read=True, read_at=timezone.now())

                if updated_count == 0:
                    return Response(
                        {
                            "success": False,
                            "message": "No notifications found or none belong to you.",
                            "data": {},
                            "error": None
                        },
                        status = status.HTTP_400_BAD_REQUEST
                    )

                return Response(
                    {
                        "success": True,
                        "message": f"{updated_count} notifications marked as viewed.",
                        "data": {},
                        "error": None
                    },
                    status = status.HTTP_200_OK
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Invalid data.",
                        "data": serializer.errors,
                        "error": None
                    },
                    status = status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            error = traceback.format_exc()
            return Response(
                {
                    "success": False,
                    "message": "An error occurred while marking notifications as viewed.",
                    "data": {},
                    "error": error
                },
                status = status.HTTP_500_INTERNAL_SERVER_ERROR
            )