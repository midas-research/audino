from django.contrib.auth import get_user_model
# from allauth.account.models import EmailAddress
from allauth.account.adapter import get_adapter
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from django.utils.crypto import get_random_string
from django.db import transaction
from users.models import User

from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from distutils.util import strtobool
from .models import Invitation, Membership, Organization
from rest_framework.throttling import UserRateThrottle

class ResendOrganizationInvitationThrottle(UserRateThrottle):
    rate = '5/hour'

class RegisterSerializerEx(RegisterSerializer):
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
        })

        return data


class BasicUserSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        if hasattr(self, 'initial_data'):
            unknown_keys = set(self.initial_data.keys()) - set(self.fields.keys())
            if unknown_keys:
                if set(['is_staff', 'is_superuser', 'groups']) & unknown_keys:
                    message = 'You do not have permissions to access some of' + \
                        ' these fields: {}'.format(unknown_keys)
                else:
                    message = 'Got unknown fields: {}'.format(unknown_keys)
                raise serializers.ValidationError(message)
        return attrs

    class Meta:
        model = User
        fields = ( 'id', 'username', 'first_name', 'last_name')

class OrganizationReadSerializer(serializers.ModelSerializer):
    owner = BasicUserSerializer(allow_null=True)
    class Meta:
        model = Organization
        fields = ['id', 'slug', 'name', 'description', 'created_date',
            'updated_date', 'contact', 'owner']
        read_only_fields = fields

class OrganizationWriteSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        serializer = OrganizationReadSerializer(instance, context=self.context)
        return serializer.data

    class Meta:
        model = Organization
        fields = ['slug', 'name', 'description', 'contact', 'owner']
        read_only_fields = ['owner']

    def create(self, validated_data):

        organization = super().create(validated_data)
        Membership.objects.create(
            user=organization.owner,
            organization=organization,
            is_active=True,
            joined_date=organization.created_date,
            role=Membership.OWNER)
        

        return organization

class InvitationReadSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(Membership.role.field.choices,
        source='membership.role')
    user = BasicUserSerializer(source='membership.user')
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(),
        source='membership.organization')
    owner = BasicUserSerializer(allow_null=True)

    class Meta:
        model = Invitation
        fields = ['key', 'created_date', 'owner', 'role', 'user', 'organization']
        read_only_fields = fields

class InvitationWriteSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(Membership.role.field.choices,
        source='membership.role')
    email = serializers.EmailField(source='membership.user.email')
    organization = serializers.PrimaryKeyRelatedField(
        source='membership.organization', read_only=True)

    def to_representation(self, instance):
        serializer = InvitationReadSerializer(instance, context=self.context)
        return serializer.data

    class Meta:
        model = Invitation
        fields = ['key', 'created_date', 'owner', 'role', 'organization', 'email']
        read_only_fields = ['key', 'created_date', 'owner', 'organization']

    @transaction.atomic
    def create(self, validated_data):
        membership_data = validated_data.pop('membership')
        organization = validated_data.pop('organization')
        try:
            user = get_user_model().objects.get(
                email__iexact=membership_data['user']['email'])
            del membership_data['user']
        except ObjectDoesNotExist:
            user_email = membership_data['user']['email']
            user = User.objects.create_user(username=user_email, password=get_random_string(length=32),
                email=user_email)
            user.set_unusable_password()

            user.save()
            del membership_data['user']
        membership, created = Membership.objects.get_or_create(
            defaults=membership_data,
            user=user, organization=organization)
        if not created:
            raise serializers.ValidationError('The user is a member of '
                'the organization already.')
        invitation = Invitation.objects.create(**validated_data,
            membership=membership)

        return invitation

    def update(self, instance, validated_data):
        return super().update(instance, {})

    def save(self, request, **kwargs):
        invitation = super().save(**kwargs)
        if not strtobool(settings.ORG_INVITATION_CONFIRM) and invitation.membership.user.is_active:
            # For existing users we auto-accept all invitations
            invitation.accept()
        else:
            invitation.send(request)

        return invitation

class MembershipReadSerializer(serializers.ModelSerializer):
    user = BasicUserSerializer()

    class Meta:
        model = Membership
        fields = ['id', 'user', 'organization', 'is_active', 'joined_date', 'role',
            'invitation']
        read_only_fields = fields
        extra_kwargs = {
            'invitation': {
                'allow_null': True,
            }
        }

class MembershipWriteSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        serializer = MembershipReadSerializer(instance, context=self.context)
        return serializer.data

    class Meta:
        model = Membership
        fields = ['id', 'user', 'organization', 'is_active', 'joined_date', 'role']
        read_only_fields = ['user', 'organization', 'is_active', 'joined_date']

class AcceptInvitationWriteSerializer(RegisterSerializerEx):
    def get_fields(self):
        fields = super().get_fields()
        fields.pop('email', default=None)
        return fields

    def save(self, request, invitation):
        self.cleaned_data = self.get_cleaned_data()
        user = invitation.membership.user
        user.is_active = True

        # we don't have to send confirmation email
        # email = EmailAddress.objects.get(email=user.email)
        # get_adapter(request).confirm_email(request, email)
        
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.username = self.cleaned_data['username']
        user.set_password(self.cleaned_data['password1'])
        user.save()
        return user

class AcceptInvitationReadSerializer(serializers.Serializer):
    organization_slug = serializers.CharField()