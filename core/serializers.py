from rest_framework import serializers
from users.serializers import UserSerializer

from .models import *


class StorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Storage
        fields = "__all__"


class GetProjectSerializer(serializers.ModelSerializer):
    source_storage = StorageSerializer()
    target_storage = StorageSerializer()
    owner = UserSerializer()
    assignee = UserSerializer()

    class Meta:
        model = Project
        fields = "__all__"


class PostProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = "__all__"


class PostLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = "__all__"


class GetLabelSerializer(serializers.ModelSerializer):
    attributes = AttributeSerializer(many=True, read_only=True)

    class Meta:
        model = Label
        fields = (
            "id",
            "name",
            "attributes",
            "label_type",
            "project",
            "created_at",
            "updated_at",
        )


class PostTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"


class GetTaskSerializer(serializers.ModelSerializer):
    source_storage = StorageSerializer()
    target_storage = StorageSerializer()
    owner = UserSerializer()
    assignee = UserSerializer()

    class Meta:
        model = Task
        fields = "__all__"


class PostJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class GetJobSerializer(serializers.ModelSerializer):
    assignee = UserSerializer()
    task = serializers.SerializerMethodField()
    # task_id = GetTaskSerializer()

    class Meta:
        model = Job
        # fields = '__all__'
        exclude = ["task_id"]

    def get_task(self, obj):
        if obj.task_id:
            task_serializer = GetTaskSerializer(obj.task_id)
            return task_serializer.data
        return None


class AnnotationAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotationAttribute
        fields = "__all__"


class DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data
        fields = "__all__"


class AnnotationDataSerializer(serializers.ModelSerializer):
    attributes = AnnotationAttributeSerializer(many=True, read_only=True)

    class Meta:
        model = AnnotationData
        fields = "__all__"


class GetAnnotationSerializer(serializers.ModelSerializer):
    labels = AnnotationDataSerializer(many=True, read_only=True)

    class Meta:
        model = Annotation
        fields = "__all__"


class PostAnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = "__all__"

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = "__all__"

class OrganisationSerializer(serializers.ModelSerializer):
    contact = ContactSerializer()

    class Meta:
        model = Organisation
        fields = "__all__"

    def create(self, validated_data):
        contact_data = validated_data.pop('contact')
        contact = Contact.objects.create(**contact_data)
        organisation = Organisation.objects.create(contact=contact, **validated_data)
        return organisation

    def update(self, instance, validated_data):
     contact_data = validated_data.pop('contact', None)
     if contact_data:
         contact = instance.contact
         contact.email = contact_data.get('email', contact.email)
         contact.phone_number = contact_data.get('phone_number', contact.phone_number)
         contact.location = contact_data.get('location', contact.location)
         contact.save()
     return super().update(instance, validated_data)