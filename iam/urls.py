from django.urls import path, re_path
from django.conf import settings
from django.urls.conf import include
from dj_rest_auth.views import (
    LogoutView, PasswordChangeView,
    PasswordResetView, PasswordResetConfirmView)
from allauth.account import app_settings as allauth_settings

from iam.views import (
    # SigningView, RegisterViewEx, RulesView,
    # ConfirmEmailViewEx, LoginViewEx
    RulesView
)

urlpatterns = [
    # path('login', LoginViewEx.as_view(), name='rest_login'),
    # path('logout', LogoutView.as_view(), name='rest_logout'),
    # path('signing', SigningView.as_view(), name='signing'),
    path('rules', RulesView.as_view(), name='rules'),
]

