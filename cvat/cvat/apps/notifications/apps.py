from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    name = 'cvat.apps.notifications'

    def ready(self) -> None:
        from cvat.apps.iam.permissions import load_app_permissions
        load_app_permissions(self)
