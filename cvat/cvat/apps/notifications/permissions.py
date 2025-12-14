from django.conf import settings
from cvat.apps.iam.permissions import OpenPolicyAgentPermission, StrEnum

class NotificationPermission(OpenPolicyAgentPermission):
    class Scopes(StrEnum):
        VIEW = 'view'
        SEND = 'send'
        MARK_AS_READ = 'mark_as_read'

    @classmethod
    def create(cls, request, view, obj, iam_context):
        permissions = []
        for scope in cls.get_scopes(request, view, obj):
            perm = cls.create_base_perm(request, view, scope, iam_context, obj)
            permissions.append(perm)

        return permissions

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.url = settings.IAM_OPA_DATA_URL + '/notifications/allow'

    @staticmethod
    def get_scopes(request, view, obj):
        Scopes = __class__.Scopes
        if view.action == 'SendNotification':
            return [Scopes.SEND]
        elif view.action == 'FetchUserNotifications':
            return [Scopes.VIEW]
        elif view.action == 'MarkNotificationAsViewed':
            return [Scopes.MARK_AS_READ]

        return []

    def get_resource(self):
        return {
            'type': 'notifications',
            'user_id': self.user_id,
        }