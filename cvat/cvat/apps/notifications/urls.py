from django.urls import path
from .views import NotificationsViewSet


notifications_viewset = NotificationsViewSet.as_view({
    'post': 'SendNotification'
})

fetch_notifications_viewset = NotificationsViewSet.as_view({
    'post': 'FetchUserNotifications'
})

mark_all_read_viewset = NotificationsViewSet.as_view({
    'post': 'MarkNotificationAsViewed'
})

urlpatterns = [
    path('notifications/send', notifications_viewset, name='send-notification'),
    path('notifications/fetch', fetch_notifications_viewset, name='fetch-user-notifications'),
    path('notifications/markallread', mark_all_read_viewset, name='mark-all-read'),
]