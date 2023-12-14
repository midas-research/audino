from django.db import transaction
from rest_framework import serializers
from users.serializers import UserSerializer
from typing import Any, Dict, Iterable, Optional, OrderedDict, Union

from .models import *

class AttributeSerializer(serializers.ModelSerializer):
    # values = serializers.CharField(max_length=4096, allow_blank=True)

    class Meta:
        model = Attribute
        fields = "__all__"
        
    def to_internal_value(self, data):
        data['values'] = str(data['values'])
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        return super().create(validated_data)

class LabelWriteSerializer(serializers.ModelSerializer):
    attributes = AttributeSerializer(many=True)

    class Meta:
        model = Label
        fields = (
            "name",
            "attributes",
            "label_type",
            "project",
            "created_at",
            "updated_at",
        )
    @transaction.atomic
    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        label = super().create(validated_data)
        self.create_attributes(label, attributes_data)
        return label

    @transaction.atomic
    def create_attributes(self, label, attributes_data):
        for attribute_data in attributes_data:
            attribute_obj = {
                "label": label.id,
                **attribute_data
            }
            attribute_serializer = AttributeSerializer(
                data=attribute_obj
            )
            attribute_serializer.is_valid(raise_exception=True)
            attribute_serializer.save()
            label.attributes.add(attribute_serializer.instance)

class LabelReadSerializer(serializers.ModelSerializer):
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
        read_only_fields = fields

class StorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Storage
        fields = "__all__"

def _configure_related_storages(validated_data: Dict[str, Any]) -> Dict[str, Optional[Storage]]:
    storages = {
        'source_storage': None,
        'target_storage': None,
    }

    for i in storages:
        if storage_conf := validated_data.get(i):
            storage_instance = Storage(**storage_conf)
            storage_instance.save()
            storages[i] = storage_instance
    return storages

class ProjectReadSerializer(serializers.ModelSerializer):
    source_storage = StorageSerializer()
    target_storage = StorageSerializer()
    owner = UserSerializer()
    assignee = UserSerializer()

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = fields
        extra_kwargs = { 'organization': { 'allow_null': True } }


class ProjectWriteSerializer(serializers.ModelSerializer):
    labels = LabelWriteSerializer(many=True, partial=True, default=[])
    assignee_id = serializers.IntegerField(write_only=True, allow_null=True, required=False)
    target_storage = StorageSerializer(required=False)
    source_storage = StorageSerializer(required=False)
   

    class Meta:
        model = Project
        fields = ("name", "source_storage", "target_storage", "owner", "assignee_id", "organization", "labels")
    
    def to_representation(self, instance):
        serializer = ProjectReadSerializer(instance, context=self.context)
        return serializer.data
    
    @transaction.atomic
    def create(self, validated_data):
        labels_data = validated_data.pop('labels', [])
        storages = _configure_related_storages({
            'source_storage': validated_data.pop('source_storage', None),
            'target_storage': validated_data.pop('target_storage', None),
        })

        project = Project.objects.create(**storages, **validated_data)
        self.create_labels(project, labels_data)
        return project

    @transaction.atomic
    def create_labels(self, project, labels_data):
        for label_data in labels_data:
            label_object = {
                "project": project.id,
                **label_data
            }
            label_instance = LabelWriteSerializer(data=label_object)
            label_instance.is_valid(raise_exception=True)
            label_instance.save()

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
        extra_kwargs = {
            'organization': { 'allow_null': True },
            'overlap': { 'allow_null': True },
        }


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

