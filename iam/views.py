import functools
import hashlib

from django.utils.functional import SimpleLazyObject
from django.http import Http404, HttpResponseBadRequest, HttpResponseRedirect
from rest_framework import views, serializers
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.permissions import AllowAny
from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.http import etag as django_etag
from rest_framework.response import Response
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView
from allauth.account import app_settings as allauth_settings
from allauth.account.views import ConfirmEmailView
from allauth.account.utils import has_verified_email, send_email_confirmation

from furl import furl

from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer, extend_schema_view
from drf_spectacular.contrib.rest_auth import get_token_serializer_class

from .authentication import Signer

def get_organization(request):
    from organizations.models import Organization

    IAM_ROLES = {role: priority for priority, role in enumerate(settings.IAM_ROLES)}
    groups = list(request.user.groups.filter(name__in=list(IAM_ROLES.keys())))
    groups.sort(key=lambda group: IAM_ROLES[group.name])
    privilege = groups[0] if groups else None

    organization = None

    try:
        org_slug = request.GET.get('org')
        org_id = request.GET.get('org_id')
        org_header = request.headers.get('X-Organization')

        if org_id is not None and (org_slug is not None or org_header is not None):
            raise ValidationError('You cannot specify "org_id" query parameter with '
                '"org" query parameter or "X-Organization" HTTP header at the same time.')

        if org_slug is not None and org_header is not None and org_slug != org_header:
            raise ValidationError('You cannot specify "org" query parameter and '
                '"X-Organization" HTTP header with different values.')

        org_slug = org_slug if org_slug is not None else org_header

        if org_slug:
            organization = Organization.objects.get(slug=org_slug)
        elif org_id:
            organization = Organization.objects.get(id=int(org_id))
    except Organization.DoesNotExist:
        raise NotFound(f'{org_slug or org_id} organization does not exist.')

    context = {
        "organization": organization,
        "privilege": getattr(privilege, 'name', None)
    }

    return context

class ContextMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        # https://stackoverflow.com/questions/26240832/django-and-middleware-which-uses-request-user-is-always-anonymous
        request.iam_context = SimpleLazyObject(lambda: get_organization(request))

        return self.get_response(request)
