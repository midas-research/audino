from django.utils.crypto import get_random_string
from django.db import transaction
from django.core.exceptions import ImproperlyConfigured
from rest_framework import permissions
from rest_framework.generics import get_object_or_404

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from rest_framework import mixins, viewsets, status
from rest_framework.permissions import SAFE_METHODS
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import OpenApiParameter

from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from .throttle import ResendOrganizationInvitationThrottle
from .mixins import PartialUpdateModelMixin

from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

from .models import Invitation, Membership, Organization

from .serializers import (
    InvitationReadSerializer, InvitationWriteSerializer,
    MembershipReadSerializer, MembershipWriteSerializer,
    OrganizationReadSerializer, OrganizationWriteSerializer,
    AcceptInvitationReadSerializer, AcceptInvitationWriteSerializer)


ORGANIZATION_OPEN_API_PARAMETERS = [
    OpenApiParameter(
        name='org',
        type=str,
        required=False,
        location=OpenApiParameter.QUERY,
        description="Organization unique slug",
    ),
    OpenApiParameter(
        name='org_id',
        type=int,
        required=False,
        location=OpenApiParameter.QUERY,
        description="Organization identifier",
    ),
    OpenApiParameter(
        name='X-Organization',
        type=str,
        required=False,
        location=OpenApiParameter.HEADER,
        description="Organization unique slug",
    ),
]

@extend_schema(tags=['organizations'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of an organization',
        responses={
            '200': OrganizationReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of organizations',
        responses={
            '200': OrganizationReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in an organization',
        request=OrganizationWriteSerializer(partial=True),
        responses={
            '200': OrganizationReadSerializer, # check OrganizationWriteSerializer.to_representation
        }),
    create=extend_schema(
        summary='Method creates an organization',
        request=OrganizationWriteSerializer,
        responses={
            '201': OrganizationReadSerializer, # check OrganizationWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes an organization',
        responses={
            '204': OpenApiResponse(description='The organization has been deleted'),
        })
)
class OrganizationViewSet(viewsets.GenericViewSet,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   mixins.CreateModelMixin,
                   mixins.DestroyModelMixin,
                   PartialUpdateModelMixin,
    ):
    queryset = Organization.objects.select_related('owner').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ('owner__username','name', 'slug', 'id')
    filter_fields = list(search_fields)
    simple_filters = list(search_fields)

    pagination_class = CustomPagination

    # lookup_fields = {'owner': 'owner__username'}

    ordering_fields = list(filter_fields)
    ordering = '-id'
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        queryset = queryset.filter(members__user=user)
        return queryset

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return OrganizationReadSerializer
        else:
            return OrganizationWriteSerializer

    def perform_create(self, serializer):
        extra_kwargs = { 'owner': self.request.user }
        if not serializer.validated_data.get('name'):
            extra_kwargs.update({ 'name': serializer.validated_data['slug'] })
        serializer.save(**extra_kwargs)

    class Meta:
        model = Membership
        fields = ("user", )

@extend_schema(tags=['memberships'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of a membership',
        responses={
            '200': MembershipReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of memberships',
        responses={
            '200': MembershipReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in a membership',
        request=MembershipWriteSerializer(partial=True),
        responses={
            '200': MembershipReadSerializer, # check MembershipWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes a membership',
        responses={
            '204': OpenApiResponse(description='The membership has been deleted'),
        })
)
class MembershipViewSet(mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
    mixins.ListModelMixin, PartialUpdateModelMixin, viewsets.GenericViewSet):
    queryset = Membership.objects.select_related('invitation', 'user').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    ordering = '-id'
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']
    search_fields = ('user__username', 'role','id')
    filter_fields = list(search_fields)
    simple_filters = list(search_fields)
    ordering_fields = list(filter_fields)

    pagination_class = CustomPagination
    
    # lookup_fields = {'user': 'user__username'}
    # iam_organization_field = 'organization'

    permission_classes = [permissions.IsAuthenticated] 

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return MembershipReadSerializer
        else:
            return MembershipWriteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.action == 'list':
            user = self.request.user
            queryset = queryset.filter(user=user)
            queryset = queryset

        return queryset

@extend_schema(tags=['invitations'])
@extend_schema_view(
    retrieve=extend_schema(
        summary='Method returns details of an invitation',
        responses={
            '200': InvitationReadSerializer,
        }),
    list=extend_schema(
        summary='Method returns a paginated list of invitations',
        responses={
            '200': InvitationReadSerializer(many=True),
        }),
    partial_update=extend_schema(
        summary='Methods does a partial update of chosen fields in an invitation',
        request=InvitationWriteSerializer(partial=True),
        responses={
            '200': InvitationReadSerializer, # check InvitationWriteSerializer.to_representation
        }),
    create=extend_schema(
        summary='Method creates an invitation',
        request=InvitationWriteSerializer,
        parameters=ORGANIZATION_OPEN_API_PARAMETERS,
        responses={
            '201': InvitationReadSerializer, # check InvitationWriteSerializer.to_representation
        }),
    destroy=extend_schema(
        summary='Method deletes an invitation',
        responses={
            '204': OpenApiResponse(description='The invitation has been deleted'),
        }),
    accept=extend_schema(
        operation_id='invitations_accept',
        summary='Method registers user and accepts invitation to organization',
        request=AcceptInvitationWriteSerializer,
        responses={
            '200': OpenApiResponse(response=AcceptInvitationReadSerializer, description='The invitation is accepted'),
            '400': OpenApiResponse(description='The invitation is expired or already accepted'),
        }),
    resend=extend_schema(
        operation_id='invitations_resend',
        summary='Method resends the invitation',
        request=None,
        responses={
            '204': OpenApiResponse(description='Invitation has been sent'),
            '400': OpenApiResponse(description='The invitation is already accepted'),
        }),
)
class InvitationViewSet(viewsets.GenericViewSet,
                   mixins.RetrieveModelMixin,
                   mixins.ListModelMixin,
                   PartialUpdateModelMixin,
                #    mixins.UpdateModelMixin,
                   mixins.CreateModelMixin,
                   mixins.DestroyModelMixin,
    ):
    queryset = Invitation.objects.all()
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    # iam_organization_field = 'membership__organization'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ('owner__username', 'key', 'id')
    filter_fields = list(search_fields)
    simple_filters = list(search_fields)
    ordering_fields = list(filter_fields) + ['created_date']
    ordering = '-created_date'
    # lookup_fields = {'owner': 'owner__username'}

    pagination_class = CustomPagination

    def get_serializer_class(self):
        if self.request.method in SAFE_METHODS:
            return InvitationReadSerializer
        else:
            return InvitationWriteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        queryset = queryset.filter(owner=user)
        return queryset

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except ImproperlyConfigured:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Email backend is not configured.")

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        # print("perform creeate",self.request)
        serializer.save(
            owner=self.request.user,
            key=get_random_string(length=64),

            # changed to get organization from request

            organization=Organization.objects.get(id=int(self.request.headers.get('organization'))),
            request=self.request,
        )

    # def partial_update(self, request, pk=None):
    #     instance = get_object_or_404(Invitation, pk=pk)
    #     serializer = self.get_serializer(instance, data=request.data, partial=True)
    #     serializer.is_valid(raise_exception=True)
    #     self.perform_update(serializer)

    #     return Response(serializer.data)


    def perform_update(self, serializer):
        # print("perform update",self.request)
        # request = serializer.context.get('request')

        # serializer.save(request=self.request)
        if 'accepted' in self.request.query_params:
            serializer.instance.accept()
        else:
            # print(serializer.context.get('request'))

            # this serializer is not having request field
            # print(serializer)

            # serializer.save(request=self.request)
            super().perform_update(serializer)


    @transaction.atomic
    @action(detail=True, methods=['POST'], url_path='accept', permission_classes=[AllowAny], authentication_classes=[])
    def accept(self, request, pk):
        try:
            invitation = Invitation.objects.get(key=pk)
            if invitation.expired:
                return Response(status=status.HTTP_400_BAD_REQUEST, data="Your invitation is expired. Please contact organization owner to renew it.")
            if invitation.membership.is_active:
                return Response(status=status.HTTP_400_BAD_REQUEST, data="Your invitation is already accepted.")
            serializer = AcceptInvitationWriteSerializer(data=request.data)
            if serializer.is_valid(raise_exception=True):
                serializer.save(request, invitation)
                invitation.accept()
                response_serializer = AcceptInvitationReadSerializer(data={'organization_slug': invitation.membership.organization.slug})
                if response_serializer.is_valid(raise_exception=True):
                    return Response(status=status.HTTP_200_OK, data=response_serializer.data)
        except Invitation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data="This invitation does not exist. Please contact organization owner.")

    @action(detail=True, methods=['POST'], url_path='resend', throttle_classes=[ResendOrganizationInvitationThrottle])
    def resend(self, request, pk):
        try:
            invitation = Invitation.objects.get(key=pk)
            if invitation.membership.is_active:
                return Response(status=status.HTTP_400_BAD_REQUEST, data="This invitation is already accepted.")
            invitation.send(request)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Invitation.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND, data="This invitation does not exist.")
        except ImproperlyConfigured:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Email backend is not configured.")
