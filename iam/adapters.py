from django.http import HttpResponseRedirect
from django.conf import settings

from allauth.account.adapter import DefaultAccountAdapter

class DefaultAccountAdapterEx(DefaultAccountAdapter):
    def respond_email_verification_sent(self, request, user):
        return HttpResponseRedirect(settings.ACCOUNT_EMAIL_VERIFICATION_SENT_REDIRECT_URL)
