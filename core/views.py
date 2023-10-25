import requests
import ast
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import parser_classes
from rest_framework.decorators import permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.manager import TokenAuthentication

from .models import Annotation as AnnotationModel
from .models import AnnotationAttribute as AnnotationAttributeModel
from .models import Attribute as AttributeModel
from .models import Data as DataModel
from .models import Job as JobModel
from .models import Label as LabelModel
from .models import Project as ProjectModel
from .models import Task as TaskModel
from .serializers import AnnotationAttributeSerializer
from .serializers import AnnotationDataSerializer
from .serializers import AttributeSerializer
from .serializers import DataSerializer
from .serializers import GetAnnotationSerializer
from .serializers import GetJobSerializer
from .serializers import GetLabelSerializer
from .serializers import GetProjectSerializer
from .serializers import GetTaskSerializer
from .serializers import PostAnnotationSerializer
from .serializers import PostJobSerializer
from .serializers import PostLabelSerializer
from .serializers import PostProjectSerializer
from .serializers import PostTaskSerializer
from .serializers import StorageSerializer
from .utils import convert_string_lists_to_lists
from .utils import get_paginator

@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_add_project(request, format=None):
    if request.method == "POST":
        data = JSONParser().parse(request)

        source_serializer = StorageSerializer(data=data["source_storage"])
        target_serializer = StorageSerializer(data=data["target_storage"])

        if source_serializer.is_valid() and target_serializer.is_valid():
            src = source_serializer.save()
            tgt = target_serializer.save()
            data["source_storage"] = src.id
            data["target_storage"] = tgt.id

        data["owner"] = request.user.id
        data["assignee"] = data.pop("assignee_id")
        serializer = PostProjectSerializer(data=data)
        if serializer.is_valid():
            project_obj = serializer.save()
            if len(data["labels"]) != 0:
                for each_label in data["labels"]:
                    label_obj = {
                        "project": project_obj.id,
                        "name": each_label["name"],
                        "label_type": each_label["type"],
                    }
                    label_serializer = PostLabelSerializer(data=label_obj)
                    if label_serializer.is_valid():
                        label_obj = label_serializer.save()
                        for each_attribute in each_label["attributes"]:
                            attribute_obj = {
                                "label": label_obj.id,
                                "name": each_attribute["name"],
                                "input_type": each_attribute["input_type"],
                                "default_value": each_attribute["default_value"],
                                "values": str(each_attribute["values"]),
                            }
                            attribute_serializer = AttributeSerializer(
                                data=attribute_obj
                            )
                            if attribute_serializer.is_valid():
                                attr_obj = attribute_serializer.save()
                                label_obj.attributes.add(attr_obj)
                            else:
                                return Response(
                                    attribute_serializer.errors,
                                    status=status.HTTP_400_BAD_REQUEST,
                                )
                    else:
                        return Response(
                            label_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                        )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    search_query = request.GET.get("search")
    page = request.GET.get("page")
    page_size = request.GET.get("page_size")
    projects = ProjectModel.objects.all().order_by("-created_at")

    if(search_query != None):
        projects = projects.filter(Q(name__icontains=search_query))
     
    paginator = get_paginator(page, page_size)
    result = paginator.paginate_queryset(projects, request)
    serializer = GetProjectSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_project(request, id, format=None):
    try:
        project = ProjectModel.objects.get(id=id)
    except ProjectModel.DoesNotExist:
        return Response(
            {"message": "Project not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "DELETE":
        project.delete()
        return Response(
            {"message": "Project Deleted Successfully !"}, status=status.HTTP_200_OK
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)

        source_serializer = StorageSerializer(
            project.source_storage, data=data["source_storage"]
        )
        target_serializer = StorageSerializer(
            project.target_storage, data=data["target_storage"]
        )

        if source_serializer.is_valid() and target_serializer.is_valid():
            src = source_serializer.save()
            tgt = target_serializer.save()
            data["source_storage"] = src.id
            data["target_storage"] = tgt.id

        serializer = PostProjectSerializer(project, data=data)
        if serializer.is_valid():
            serializer.save()
            for each_label in data["labels"]:
                label_object = {
                    "project": id,
                    "name": each_label["name"],
                    "label_type": each_label["label_type"],
                }
                if "id" in each_label:
                    label = LabelModel.objects.get(id=each_label["id"])
                    label_serializer = PostLabelSerializer(label, data=label_object)
                else:
                    label_serializer = PostLabelSerializer(data=label_object)

                if label_serializer.is_valid():
                    label_obj = label_serializer.save()
                    for each_attribute in each_label["attributes"]:
                        attribute_obj = {
                            "label": label_obj.id,
                            "name": each_attribute["name"],
                            "input_type": each_attribute["input_type"],
                            "default_value": each_attribute["default_value"],
                            "values": str(each_attribute["values"]),
                        }
                        if "id" in each_attribute:
                            attribute = AttributeModel.objects.get(
                                id=each_attribute["id"]
                            )
                            attribute_serializer = AttributeSerializer(
                                attribute, data=attribute_obj
                            )
                        else:
                            attribute_serializer = AttributeSerializer(
                                data=attribute_obj
                            )

                        if attribute_serializer.is_valid():
                            attribute_obj = attribute_serializer.save()
                            label_obj.attributes.add(attribute_obj)
                        else:
                            return Response(
                                attribute_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )

                else:
                    return Response(
                        label_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = GetProjectSerializer(project)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_labels(request, format=None):
    project_id = request.query_params["project_id"]

    labels = LabelModel.objects.filter(
        project=project_id
    ).order_by("-created_at")

    serializer = GetLabelSerializer(labels, many=True)
    temp_serializer = serializer.data

    for each_serializer in temp_serializer:
        each_serializer = dict(each_serializer)
        for i, each_attribute in enumerate(each_serializer['attributes']):
            each_serializer['attributes'][i] = dict(each_attribute)
            each_serializer['attributes'][i]['values'] = ast.literal_eval(each_serializer['attributes'][i]['values'])

    return Response(temp_serializer, status=status.HTTP_200_OK)


@api_view(["GET", "PATCH", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_label_by_id(request, id, format=None):
    try:
        label = LabelModel.objects.get(id=id)
    except LabelModel.DoesNotExist:
        return Response(
            {"message": "Label object not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "DELETE":
        label.delete()
        return Response(
            {"message": "Label Deleted Successfully !"}, status=status.HTTP_200_OK
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)
        label_object = {
            "project": data["project"],
            "name": data["name"],
            "label_type": data["label_type"],
        }

        label_serializer = PostLabelSerializer(label, data=label_object)
        if label_serializer.is_valid():
            label_obj = label_serializer.save()
            for each_attribute in data["attributes"]:
                attribute_obj = {
                    "label": label_obj.id,
                    "name": each_attribute["name"],
                    "mutable": each_attribute["mutable"],
                    "input_type": each_attribute["input_type"],
                    "default_value": each_attribute["default_value"],
                    "values": str(each_attribute["values"]),
                }
                if "id" in each_attribute:
                    attribute = AttributeModel.objects.get(id=each_attribute["id"])
                    attribute_serializer = AttributeSerializer(
                        attribute, data=attribute_obj
                    )
                else:
                    attribute_serializer = AttributeSerializer(data=attribute_obj)

                if attribute_serializer.is_valid():
                    attribute_obj = attribute_serializer.save()
                    label_obj.attributes.add(attribute_obj)
                else:
                    return Response(
                        attribute_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            return Response(label_serializer.data, status=status.HTTP_200_OK)
        return Response(label_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = GetLabelSerializer(label)
    temp_serializer = convert_string_lists_to_lists(serializer.data)
    return Response(temp_serializer, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def jobs(request, format=None):
    if request.method == "POST":
        job_serializer = PostJobSerializer(data=request.data)
        if job_serializer.is_valid():
            job_serializer.save()
            return Response(job_serializer.data, status=status.HTTP_201_CREATED)
        return Response(job_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    search_query = request.GET.get("search")
    page = request.GET.get("page")
    page_size = request.GET.get("page_size")
    jobs = JobModel.objects.all().order_by("-created_at")

    if(search_query != None):
        jobs = jobs.filter(Q(task_id__name__icontains=search_query))
     
    paginator = get_paginator(page, page_size)
    result = paginator.paginate_queryset(jobs, request)
    serializer = GetJobSerializer(result, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(["GET", "DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_job_by_id(request, job_id, format=None):
    try:
        job = JobModel.objects.get(id=job_id)
    except JobModel.DoesNotExist:
        return Response(
            {"message": "Job does not exists."}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "DELETE":
        job.delete()
        return Response(
            {"message": "Job deleted successfully"}, status=status.HTTP_200_OK
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)
        serializer = PostJobSerializer(job, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = GetJobSerializer(job)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def tasks(request, format=None):
    header = {"Authorization": request.META["HTTP_AUTHORIZATION"]}
    if request.method == "POST":
        data = JSONParser().parse(request)

        source_serializer = StorageSerializer(data=data["source_storage"])
        target_serializer = StorageSerializer(data=data["target_storage"])

        if source_serializer.is_valid() and target_serializer.is_valid():
            src = source_serializer.save()
            tgt = target_serializer.save()
            data["source_storage"] = src.id
            data["target_storage"] = tgt.id

        data["project"] = data.pop("project_id")
        data["owner"] = request.user.id
        data["assignee"] = data.pop("assignee_id")
        serializer = PostTaskSerializer(data=data)
        if serializer.is_valid():
            task_obj = serializer.save()
            job_data = {
                "assignee": task_obj.assignee.id,
                "stage": "annotation",
                "state": "new",
                "project_id": task_obj.project.id,
                "guide_id": task_obj.owner.id,
                "task_id": task_obj.id,
            }
            resp = requests.post(
                f"{request.build_absolute_uri('/')}api/jobs",
                data=job_data,
                headers=header,
            )
            job_data = {
                "count": len(JobModel.objects.filter(task_id=task_obj.id)),
                "completed": len(
                    JobModel.objects.filter(task_id=task_obj.id, state="completed")
                ),
                "validation": len(
                    JobModel.objects.filter(task_id=task_obj.id, stage="validation")
                ),
            }
            project_labels = LabelModel.objects.filter(project=task_obj.project.id)
            for each_project_label in project_labels:
                task_obj.labels.add(each_project_label)

            final_data = dict(serializer.data)
            final_data["jobs"] = job_data
            return Response(final_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    search_query = request.GET.get("search")
    page = request.GET.get("page")
    page_size = request.GET.get("page_size")

    tasks = TaskModel.objects.all().order_by("-created_at")

    if search_query:
            tasks = tasks.filter(
                Q(name__icontains=search_query)  
            )
            
    paginator = get_paginator(page, page_size)
    temp = paginator.paginate_queryset(tasks, request)

    serializer = GetTaskSerializer(temp, many=True)
    temp_serializer = serializer.data
    result = []

    for each_serializer in temp_serializer:
        each_serializer = dict(each_serializer)
        job_data = {
            "count": len(JobModel.objects.filter(task_id=each_serializer["id"])),
            "completed": len(
                JobModel.objects.filter(
                    task_id=each_serializer["id"], state="completed"
                )
            ),
            "validation": len(
                JobModel.objects.filter(
                    task_id=each_serializer["id"], stage="validation"
                )
            ),
        }
        each_serializer["jobs"] = job_data
        result.append(each_serializer)

    return paginator.get_paginated_response(result)


@api_view(["GET", "DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_task_by_id(request, task_id, format=None):
    try:
        task = TaskModel.objects.get(id=task_id)
    except TaskModel.DoesNotExist:
        return Response(
            {"message": "Task does not exist."}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "DELETE":
        task.delete()
        return Response(
            {"message": "Task deleted successfully"}, status=status.HTTP_200_OK
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)

        source_serializer = StorageSerializer(
            task.source_storage, data=data["source_storage"]
        )
        target_serializer = StorageSerializer(
            task.target_storage, data=data["target_storage"]
        )

        if source_serializer.is_valid() and target_serializer.is_valid():
            src = source_serializer.save()
            tgt = target_serializer.save()
            data["source_storage"] = src.id
            data["target_storage"] = tgt.id

        data["project"] = data.pop("project_id")
        data["owner"] = request.user.id
        data["assignee"] = data.pop("assignee_id")
        serializer = PostTaskSerializer(task, data=data)
        if serializer.is_valid():
            serializer.save()
            # for each_label in data['labels']:
            #     if 'id' in each_label:
            #         label_object = LabelModel.objects.get(id=each_label['id'])
            #         label_serializer = PostLabelSerializer(label_object, data=each_label)

            #         if label_serializer.is_valid():
            #             label_serializer.save()
            #         else: return Response(label_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = GetTaskSerializer(task)
    temp_serializer = dict(serializer.data)
    job_data = {
        "count": len(JobModel.objects.filter(task_id=temp_serializer["id"])),
        "completed": len(
            JobModel.objects.filter(task_id=temp_serializer["id"], state="completed")
        ),
        "validation": len(
            JobModel.objects.filter(task_id=temp_serializer["id"], stage="validation")
        ),
    }
    temp_serializer["jobs"] = job_data
    return Response(temp_serializer, status=status.HTTP_200_OK)


@api_view(["GET", "POST", "DELETE"])
@parser_classes([MultiPartParser])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_data(request, task_id, format=None):
    if request.method == "POST":
        print(request.data)
        file_data = {
            "task": task_id,
            "filename": request.data["file"].name,
            "size": (request.data["file"].size) // 1024,
            "file": request.data["file"],
        }
        serializer = DataSerializer(data=file_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        data = DataModel.objects.filter(task=task_id)
        if len(data) == 0:
            return Response(
                {"message": "No data are associated with this task."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for each_data in data:
            each_data.delete()

        return Response(
            {"message": f"Data for task id {task_id} has been deleted successfully."},
            status=status.HTTP_200_OK,
        )

    task_data = DataModel.objects.filter(task=task_id).first()
    serializer = DataSerializer(task_data)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def job_annotation(request, job_id, format=None):
    if request.method == "POST" and JobModel.objects.filter(id=job_id).exists():
        data = JSONParser().parse(request)
        data["job"] = job_id

        serializer = PostAnnotationSerializer(data=data)
        if serializer.is_valid():
            annotation_obj = serializer.save()
            for each_label in data["label"]:
                ann_data = {
                    "label": each_label["id"],
                    "name": LabelModel.objects.get(id=each_label["id"]).name,
                }
                ann_data_serializer = AnnotationDataSerializer(data=ann_data)
                if ann_data_serializer.is_valid():
                    ann_obj = ann_data_serializer.save()
                    annotation_obj.labels.add(ann_obj)

                    for each_attri in each_label["attributes"]:
                        ann_attribute_data = {
                            "attribute": each_attri["id"],
                            "values": str(each_attri["values"]),
                        }
                        ann_attribute_serializer = AnnotationAttributeSerializer(
                            data=ann_attribute_data
                        )
                        if ann_attribute_serializer.is_valid():
                            ann_att_obj = ann_attribute_serializer.save()
                            ann_obj.attributes.add(ann_att_obj)
                        else:
                            return Response(
                                ann_attribute_serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                else:
                    return Response(
                        ann_data_serializer.errors, status=status.HTTP_400_BAD_REQUEST
                    )

            final_data = dict(GetAnnotationSerializer(annotation_obj).data)
            final_data = convert_string_lists_to_lists(final_data)
            return Response(final_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    annotations = AnnotationModel.objects.filter(job=job_id)
    if len(annotations) == 0:
        return Response([], status=status.HTTP_200_OK)
    
    serializer = GetAnnotationSerializer(annotations, many=True)
    temp_serializer = serializer.data
    result = []
    for each_serializer in temp_serializer:
        each_serializer = dict(each_serializer)
        for each_attribute in each_serializer['labels']:
            each_attribute = dict(each_attribute)
            for each_att in each_attribute['attributes']:
                each_att['values'] = ast.literal_eval(each_att['values'])

        result.append(each_serializer)

    return Response(result, status=status.HTTP_200_OK)


@api_view(["GET", "DELETE", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def annotations(request, job_id, a_id, format=None):
    try:
        annotation = AnnotationModel.objects.get(id=a_id)
    except AnnotationModel.DoesNotExist:
        return Response(
            {"message": "Annotation with given Id does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "DELETE":
        annotation.delete()
        return Response(
            {"message": f"Annotation with {a_id} deleted successfully"},
            status=status.HTTP_200_OK,
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)

        serializer = PostAnnotationSerializer(annotation, data=data)
        if serializer.is_valid():
            ann = serializer.save()
            for each_label in data["label"]:
                for each_attri in each_label["attributes"]:
                    attri_obj = AnnotationAttributeModel.objects.get(
                        id=each_attri["id"]
                    )
                    each_attri["values"] = str(each_attri["values"])
                    ann_attribute_serializer = AnnotationAttributeSerializer(
                        attri_obj, data=each_attri
                    )
                    if ann_attribute_serializer.is_valid():
                        ann_attribute_serializer.save()
                    else:
                        return Response(
                            ann_attribute_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST,
                        )

            final_data = dict(GetAnnotationSerializer(ann).data)
            final_data = convert_string_lists_to_lists(final_data)
            return Response(final_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    final_data = dict(GetAnnotationSerializer(annotation).data)
    final_data = convert_string_lists_to_lists(final_data)
    return Response(final_data, status=status.HTTP_200_OK)
