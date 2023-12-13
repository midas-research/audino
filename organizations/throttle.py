from rest_framework.throttling import UserRateThrottle

class ResendOrganizationInvitationThrottle(UserRateThrottle):
    rate = '5/hour'