# Copyright (C) 2023 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import textwrap

from django.db import transaction
from django.db.models import Q, QuerySet
from django.http import HttpResponse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from cvat.apps.engine.mixins import PartialUpdateModelMixin
from cvat.apps.engine.models import Job, JobType, Task
from cvat.apps.engine.serializers import RqIdSerializer
from cvat.apps.engine.utils import get_server_url
from cvat.apps.quality_control import quality_reports as qc
from cvat.apps.quality_control.models import (
    AnnotationConflict,
    QualityReport,
    QualityReportTarget,
    QualitySettings,
)
from cvat.apps.quality_control.permissions import (
    AnnotationConflictPermission,
    QualityReportPermission,
    QualitySettingPermission,
)
from cvat.apps.quality_control.serializers import (
    AnnotationConflictSerializer,
    ImmediateQualityReportCreateSerializer,
    QualityReportCreateSerializer,
    QualityReportSerializer,
    QualitySettingsSerializer,
)
from rest_framework.permissions import IsAuthenticated


@extend_schema(tags=["quality"])
@extend_schema_view(
    list=extend_schema(
        summary="List annotation conflicts in a quality report",
        parameters=[
            # These filters are implemented differently from others
            OpenApiParameter(
                "report_id",
                type=OpenApiTypes.INT,
                description="A simple equality filter for report id",
            ),
        ],
        responses={
            "200": AnnotationConflictSerializer(many=True),
        },
    ),
)
class QualityConflictsViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    queryset = (
        AnnotationConflict.objects.select_related(
            "report",
            "report__parent",
            "report__job",
            "report__job__segment",
            "report__job__segment__task",
            "report__job__segment__task__organization",
            "report__task",
            "report__task__organization",
        )
        .prefetch_related(
            "annotation_ids",
        )
        .all()
    )

    iam_organization_field = [
        "report__job__segment__task__organization",
        "report__task__organization",
    ]

    search_fields = []
    filter_fields = list(search_fields) + ["id", "frame", "type", "job_id", "task_id", "severity"]
    simple_filters = set(filter_fields) - {"id"}
    lookup_fields = {
        "job_id": "report__job__id",
        "task_id": "report__job__segment__task__id",  # task reports do not contain own conflicts
    }
    ordering_fields = list(filter_fields)
    ordering = "-id"
    serializer_class = AnnotationConflictSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.action == "list":
            if report_id := self.request.query_params.get("report_id", None):
                # NOTE: This filter is too complex to be implemented by other means,
                # it has a dependency on the report type
                try:
                    report = QualityReport.objects.get(id=report_id)
                except QualityReport.DoesNotExist as ex:
                    raise NotFound(f"Report {report_id} does not exist") from ex

                self.check_object_permissions(self.request, report)

                if report.target == QualityReportTarget.TASK:
                    queryset = queryset.filter(
                        Q(report=report) | Q(report__parent=report)
                    ).distinct()
                elif report.target == QualityReportTarget.JOB:
                    queryset = queryset.filter(report=report)
                else:
                    assert False
            else:
                perm = AnnotationConflictPermission.create_scope_list(self.request)
                queryset = perm.filter(queryset)

        return queryset


@extend_schema(tags=["quality"])
@extend_schema_view(
    retrieve=extend_schema(
        operation_id="quality_retrieve_report",  # the default produces the plural
        summary="Get quality report details",
        responses={
            "200": QualityReportSerializer,
        },
    ),
    list=extend_schema(
        summary="List quality reports",
        parameters=[
            # These filters are implemented differently from others
            OpenApiParameter(
                "task_id", type=OpenApiTypes.INT, description="A simple equality filter for task id"
            ),
            OpenApiParameter(
                "target", type=OpenApiTypes.STR, description="A simple equality filter for target"
            ),
        ],
        responses={
            "200": QualityReportSerializer(many=True),
        },
    ),
)
class QualityReportViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
):
    queryset = QualityReport.objects.prefetch_related(
        "job",
        "job__segment",
        "job__segment__task",
        "job__segment__task__organization",
        "task",
        "task__organization",
    ).all()

    iam_organization_field = ["job__segment__task__organization", "task__organization"]

    search_fields = []
    filter_fields = list(search_fields) + [
        "id",
        "job_id",
        "created_date",
        "gt_last_updated",
        "target_last_updated",
        "parent_id",
    ]
    simple_filters = list(
        set(filter_fields) - {"id", "created_date", "gt_last_updated", "target_last_updated"}
    )
    ordering_fields = list(filter_fields)
    ordering = "id"

    def get_serializer_class(self):
        # a separate method is required for drf-spectacular to work
        return QualityReportSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.action == "list":
            if task_id := self.request.query_params.get("task_id", None):
                # NOTE: This filter is too complex to be implemented by other means
                try:
                    task = Task.objects.get(id=task_id)
                except Task.DoesNotExist as ex:
                    raise NotFound(f"Task {task_id} does not exist") from ex

                self.check_object_permissions(self.request, task)

                queryset = queryset.filter(
                    Q(job__segment__task__id=task_id) | Q(task__id=task_id)
                ).distinct()
            else:
                perm = QualityReportPermission.create_scope_list(self.request)
                queryset = perm.filter(queryset)

            if target := self.request.query_params.get("target", None):
                if target == QualityReportTarget.JOB:
                    queryset = queryset.filter(job__isnull=False)
                elif target == QualityReportTarget.TASK:
                    queryset = queryset.filter(task__isnull=False)
                else:
                    raise ValidationError(
                        "Unexpected 'target' filter value '{}'. Valid values are: {}".format(
                            target, ", ".join(m[0] for m in QualityReportTarget.choices())
                        )
                    )

        return queryset

    CREATE_REPORT_RQ_ID_PARAMETER = "rq_id"

    @extend_schema(
        operation_id="quality_create_report",
        summary="Create a quality report",
        parameters=[
            OpenApiParameter(
                CREATE_REPORT_RQ_ID_PARAMETER,
                type=str,
                description=textwrap.dedent(
                    """\
                    The report creation request id. Can be specified to check the report
                    creation status.
                """
                ),
            )
        ],
        request=QualityReportCreateSerializer(required=False),
        responses={
            "201": QualityReportSerializer,
            "202": OpenApiResponse(
                RqIdSerializer,
                description=textwrap.dedent(
                    """\
                    A quality report request has been enqueued, the request id is returned.
                    The request status can be checked at this endpoint by passing the {}
                    as the query parameter. If the request id is specified, this response
                    means the quality report request is queued or is being processed.
                """.format(
                        CREATE_REPORT_RQ_ID_PARAMETER
                    )
                ),
            ),
            "400": OpenApiResponse(
                description="Invalid or failed request, check the response data for details"
            ),
        },
    )
    def create(self, request, *args, **kwargs):
        self.check_permissions(request)

        rq_id = request.query_params.get(self.CREATE_REPORT_RQ_ID_PARAMETER, None)

        if rq_id is None:
            input_serializer = QualityReportCreateSerializer(data=request.data)
            input_serializer.is_valid(raise_exception=True)

            task_id = input_serializer.validated_data["task_id"]

            try:
                task = Task.objects.get(pk=task_id)
            except Task.DoesNotExist as ex:
                raise NotFound(f"Task {task_id} does not exist") from ex

            try:
                rq_id = qc.QualityReportUpdateManager().schedule_quality_check_job(
                    task, user_id=request.user.id
                )
                serializer = RqIdSerializer({"rq_id": rq_id})
                return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
            except qc.QualityReportUpdateManager.QualityReportsNotAvailable as ex:
                raise ValidationError(str(ex))

        else:
            serializer = RqIdSerializer(data={"rq_id": rq_id})
            serializer.is_valid(raise_exception=True)
            rq_id = serializer.validated_data["rq_id"]

            report_manager = qc.QualityReportUpdateManager()
            rq_job = report_manager.get_quality_check_job(rq_id)
            if (
                not rq_job
                or not QualityReportPermission.create_scope_check_status(
                    request, job_owner_id=rq_job.meta["user_id"]
                )
                .check_access()
                .allow
            ):
                # We should not provide job existence information to unauthorized users
                raise NotFound("Unknown request id")

            if rq_job.is_failed:
                message = str(rq_job.exc_info)
                rq_job.delete()
                raise ValidationError(message)
            elif rq_job.is_queued or rq_job.is_started:
                return Response(status=status.HTTP_202_ACCEPTED)
            elif rq_job.is_finished:
                return_value = rq_job.return_value()
                rq_job.delete()
                if not return_value:
                    raise ValidationError("No report has been computed")

                report = self.get_queryset().get(pk=return_value)
                report_serializer = QualityReportSerializer(instance=report)
                return Response(
                    data=report_serializer.data,
                    status=status.HTTP_201_CREATED,
                    headers=self.get_success_headers(report_serializer.data),
                )

    @extend_schema(
        summary='Get immediate audio comparison score for a single job.',
        description=textwrap.dedent(
            """\
            Calculates and returns a quality report for a specific annotation job (audio type) in real-time,
            comparing it against the Ground Truth job within the same task. This report is not saved to the database.
            The `job_id` must be provided in the request body.
            """
        ),
        request=ImmediateQualityReportCreateSerializer,
        responses={
            "200": OpenApiResponse(
                response={"type": "object"},
                description="Immediate quality score report for the specified job_id."
            ),
            "400": OpenApiResponse(description="Bad Request: Missing data, invalid job type."),
        },
    )
    @action(detail=False, methods=['POST'], url_path='immediate-reports', permission_classes=[IsAuthenticated])
    def immediate_reports(self, request, *args, **kwargs):
        input_serializer = ImmediateQualityReportCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        # Enforce job_id requirement here
        job_id = input_serializer.validated_data.get("job_id")
        if job_id is None:
            raise ValidationError({"job_id": "This field is necessary for immediate quality report calculation."})

        try:
            with transaction.atomic():
                current_job = Job.objects.select_related(
                    "segment__task__data"
                ).get(id=job_id, type=JobType.ANNOTATION)

                task = current_job.segment.task

                if not task.data:
                    raise ValidationError({"detail": "Task data is missing for the associated task."})

                gt_job = Job.objects.select_related(
                    "segment"
                ).get(segment__task=task, type=JobType.GROUND_TRUTH)

                annotation_job_ids = list(
                    Job.objects.filter(segment__task=task, type=JobType.ANNOTATION)
                    .order_by('id')
                    .values_list('id', flat=True)
                )

                try:
                    current_job_index = annotation_job_ids.index(current_job.id)
                except ValueError:
                    raise NotFound(f"Annotation job {job_id} not found among task's ordered annotation jobs.")

                time_stamps = gt_job.segment.time_stamps

                offset = 0.0
                current_job_duration_sec = 0.0

                if time_stamps:
                    if current_job_index > 0:
                        prev_durations_ms = time_stamps[1 : 2 * current_job_index : 2]
                        offset = sum(prev_durations_ms) / 1000.0

                    if len(time_stamps) > 2 * current_job_index + 1:
                        current_job_duration_sec = time_stamps[2 * current_job_index + 1] / 1000.0

                quality_params = qc.QualityReportUpdateManager()._get_task_quality_params(task)

                job_data_provider = qc.JobDataProvider(current_job.id)
                gt_job_data_provider = qc.JobDataProvider(gt_job.id)

                gt_job_frames = gt_job_data_provider.job_data.get_included_frames()
                job_data_provider = qc.JobDataProvider(current_job.id, included_frames=gt_job_frames)

                gt_dataset = gt_job_data_provider.job_annotation.data["shapes"]
                ds_dataset = job_data_provider.job_annotation.data["shapes"]

                start_time = offset
                end_time = start_time + current_job_duration_sec

                if current_job_duration_sec <= 0.0:
                    return 1

                # Filter gt_dataset to include only those within the job's time bounds
                gt_samples_filtered = [
                    gt_ann
                    for gt_ann in gt_dataset
                    if (start_time - 1.5) <= gt_ann["points"][0] and gt_ann["points"][3] <= (end_time + 1.5)
                ]

                # Filtering ds_dataset to include only those within intersecting region of GT
                ds_samples_filtered = [
                    ds_ann for ds_ann in ds_dataset if ds_ann["points"][3] <= (current_job_duration_sec + 1.5)
                ]


                gt_samples_filtered.sort(key=lambda ann: ann["points"][0])
                ds_samples_filtered.sort(key=lambda ann: ann["points"][0])

                gt_transcriptions = " ".join([gt.get("transcript", "") for gt in gt_samples_filtered]).lower()
                ds_transcriptions = " ".join([ds.get("transcript", "") for ds in ds_samples_filtered]).lower()

                comparator = qc.AudioDatasetComparator(
                    job_data_provider,
                    gt_job_data_provider,
                    offset,
                    current_job_duration_sec,
                    settings=quality_params,
                )
                wer = min(max(comparator._calculate_wer(gt_transcriptions, ds_transcriptions), 0.0), 1.0)
                cer = min(max(comparator._calculate_cer(gt_transcriptions, ds_transcriptions), 0.0), 1.0)

                score = min(max((1 - wer + 1 - cer) / 2.0, 0.0), 1.0)
                expected_score = (quality_params.wer_threshold + quality_params.cer_threshold) / 2.0

                response_data = {
                    "score": score,
                    "expected_score": expected_score,
                }

                return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            raise ValidationError(f"An internal server error occurred: {str(e)}")

    @extend_schema(
        operation_id="quality_retrieve_report_data",
        summary="Get quality report contents",
        responses={"200": OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=["GET"], url_path="data", serializer_class=None)
    def data(self, request, pk):
        report = self.get_object()  # check permissions
        json_report = qc.prepare_report_for_downloading(report, host=get_server_url(request))
        return HttpResponse(json_report.encode())


@extend_schema(tags=["quality"])
@extend_schema_view(
    list=extend_schema(
        summary="List quality settings instances",
        responses={
            "200": QualitySettingsSerializer(many=True),
        },
    ),
    retrieve=extend_schema(
        summary="Get quality settings instance details",
        parameters=[
            OpenApiParameter(
                "id",
                type=OpenApiTypes.INT,
                location="path",
                description="An id of a quality settings instance",
            )
        ],
        responses={
            "200": QualitySettingsSerializer,
        },
    ),
    partial_update=extend_schema(
        summary="Update a quality settings instance",
        parameters=[
            OpenApiParameter(
                "id",
                type=OpenApiTypes.INT,
                location="path",
                description="An id of a quality settings instance",
            )
        ],
        request=QualitySettingsSerializer(partial=True),
        responses={
            "200": QualitySettingsSerializer,
        },
    ),
)
class QualitySettingsViewSet(
    viewsets.GenericViewSet,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    PartialUpdateModelMixin,
):
    queryset = QualitySettings.objects.select_related("task", "task__organization").all()

    iam_organization_field = "task__organization"

    search_fields = []
    filter_fields = ["id", "task_id"]
    simple_filters = ["task_id"]
    ordering_fields = ["id"]
    ordering = "id"

    serializer_class = QualitySettingsSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.action == "list":
            permissions = QualitySettingPermission.create_scope_list(self.request)
            queryset = permissions.filter(queryset)

        return queryset
