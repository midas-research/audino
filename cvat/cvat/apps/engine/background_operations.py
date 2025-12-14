# Copyright (C) 2024 CVAT.ai Corporation
#
# SPDX-License-Identifier: MIT

import os
import os.path as osp
import av
import math
import subprocess
import cvat.apps.dataset_manager as dm

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Callable, Dict, Optional, Union

import django_rq
from attrs.converters import to_bool
from django.conf import settings
from django.http.request import HttpRequest
from django.utils import timezone
from django_rq.queues import DjangoRQ
from django.db import transaction
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rq.job import Job as RQJob
from rq.job import JobStatus as RQJobStatus
from rq import get_current_job

from cvat.apps.engine import models
from cvat.apps.engine.backup import ProjectExporter, TaskExporter, create_backup
from cvat.apps.engine.cloud_provider import export_resource_to_cloud_storage
from cvat.apps.engine.location import StorageType, get_location_configuration
from cvat.apps.engine.log import ServerLogManager
from cvat.apps.engine.models import DataChoice, Location, Project, Task
from cvat.apps.engine.permissions import get_cloud_storage_for_import_or_export
from cvat.apps.engine.rq_job_handler import RQIdManager, RQJobMetaField
from cvat.apps.engine.serializers import RqIdSerializer
from cvat.apps.engine.utils import (
    build_annotations_file_name,
    build_backup_file_name,
    define_dependent_job,
    get_rq_job_meta,
    get_rq_lock_by_user,
    sendfile,
    AudioSegmentHandler,
)
from cvat.apps.events.handlers import handle_dataset_export
from cvat.apps.engine.media_extractors import (AudioChunkWriter)


slogger = ServerLogManager(__name__)


class _ResourceExportManager(ABC):
    QUEUE_NAME = settings.CVAT_QUEUES.EXPORT_DATA.value

    def __init__(
        self,
        version: int,
        db_instance: Union[models.Project, models.Task, models.Job],
        *,
        export_callback: Callable,
    ) -> None:
        """
        Args:
            version (int): API endpoint version to use. Possible options: 1 or 2
            db_instance (Union[models.Project, models.Task, models.Job]): Model instance
            export_callback (Callable): Main function that will be executed in the background
        """
        self.version = version
        self.db_instance = db_instance
        self.resource = db_instance.__class__.__name__.lower()
        if self.resource not in self.SUPPORTED_RESOURCES:
            raise ValueError(
                "Unexpected type of db_instance: {}".format(type(db_instance))
            )

        self.export_callback = export_callback

    @abstractmethod
    def export(self) -> Response:
        pass

    @abstractmethod
    def setup_background_job(self, queue: DjangoRQ, rq_id: str) -> None:
        pass

    @abstractmethod
    def _handle_rq_job_v1(self, rq_job: RQJob, queue: DjangoRQ) -> Optional[Response]:
        pass

    def _handle_rq_job_v2(self, rq_job: RQJob, *args, **kwargs) -> Optional[Response]:
        rq_job_status = rq_job.get_status(refresh=False)
        if rq_job_status in {
            RQJobStatus.FINISHED,
            RQJobStatus.FAILED,
            RQJobStatus.CANCELED,
            RQJobStatus.STOPPED,
        }:
            rq_job.delete()
            return None

        return Response(
            data=f"Export process is already {'started' if rq_job_status == RQJobStatus.STARTED else 'queued'}",
            status=status.HTTP_409_CONFLICT,
        )

    def handle_rq_job(self, *args, **kwargs) -> Optional[Response]:
        if self.version == 1:
            return self._handle_rq_job_v1(*args, **kwargs)
        elif self.version == 2:
            return self._handle_rq_job_v2(*args, **kwargs)

        raise ValueError("Unsupported version")

    @abstractmethod
    def get_v1_endpoint_view_name(self) -> str:
        pass

    def make_result_url(self) -> str:
        view_name = self.get_v1_endpoint_view_name()
        result_url = reverse(
            view_name, args=[self.db_instance.pk], request=self.request
        )
        query_dict = self.request.query_params.copy()
        query_dict["action"] = "download"
        result_url += "?" + query_dict.urlencode()

        return result_url

    def get_instance_update_time(self) -> datetime:
        instance_update_time = timezone.localtime(self.db_instance.updated_date)
        if isinstance(self.db_instance, Project):
            tasks_update = list(
                map(
                    lambda db_task: timezone.localtime(db_task.updated_date),
                    self.db_instance.tasks.all(),
                )
            )
            instance_update_time = max(tasks_update + [instance_update_time])
        return instance_update_time

    def get_timestamp(self, time_: datetime) -> str:
        return datetime.strftime(time_, "%Y_%m_%d_%H_%M_%S")

class DatasetExportManager(_ResourceExportManager):
    SUPPORTED_RESOURCES = {"project", "task", "job"}

    @dataclass
    class ExportArgs:
        format: str
        filename: str
        save_images: bool
        location_config: Dict[str, Any]

        @property
        def location(self) -> Location:
            return self.location_config["location"]

    def __init__(
        self,
        db_instance: Union[models.Project, models.Task, models.Job],
        request: HttpRequest,
        export_callback: Callable,
        save_images: Optional[bool] = None,
        *,
        version: int = 2,
    ) -> None:
        super().__init__(version, db_instance, export_callback=export_callback)
        self.request = request

        format_name = request.query_params.get("format", "")
        filename = request.query_params.get("filename", "")
        # can be passed directly when it is initialized based on API request, not query param
        save_images = (
            save_images
            if save_images is not None
            else to_bool(request.query_params.get("save_images", False))
        )

        try:
            location_config = get_location_configuration(
                db_instance=db_instance,
                query_params=request.query_params,
                field_name=StorageType.TARGET,
            )
        except ValueError as ex:
            raise serializers.ValidationError(str(ex)) from ex

        location = location_config["location"]

        if location not in Location.list():
            raise serializers.ValidationError(
                f"Unexpected location {location} specified for the request"
            )

        self.export_args = self.ExportArgs(
            format=format_name,
            filename=filename,
            save_images=save_images,
            location_config=location_config,
        )
        self.EXPORT_FOR = ""
        AUDIO_FORMATS = ["Audino Format", "Common Voice", "Librispeech", "VoxPopuli", "Ted-Lium", "VoxCeleb", "VCTK_Corpus", "LibriVox"]
        if format_name in AUDIO_FORMATS:
            self.EXPORT_FOR = "audio"

    def _handle_rq_job_v1(
        self,
        rq_job: RQJob,
        queue: DjangoRQ,
    ) -> Optional[Response]:
        action = self.request.query_params.get("action")
        if action not in {None, "download"}:
            raise serializers.ValidationError(
                "Unexpected action specified for the request"
            )

        request_time = rq_job.meta.get("request", {}).get("timestamp")
        instance_update_time = self.get_instance_update_time()
        if request_time is None or request_time < instance_update_time:
            # The result is outdated, need to restart the export.
            # Cancel the current job.
            # The new attempt will be made after the last existing job.
            # In the case the server is configured with ONE_RUNNING_JOB_IN_QUEUE_PER_USER
            # we have to enqueue dependent jobs after canceling one.
            rq_job.cancel(enqueue_dependents=settings.ONE_RUNNING_JOB_IN_QUEUE_PER_USER)
            rq_job.delete()
            return None

        instance_timestamp = self.get_timestamp(instance_update_time)

        REQUEST_TIMEOUT = 60

        if action == "download":
            if self.export_args.location != Location.LOCAL:
                return Response(
                    'Action "download" is only supported for a local export location',
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not rq_job.is_finished:
                return Response(
                    "Export has not finished", status=status.HTTP_400_BAD_REQUEST
                )

            file_path = rq_job.return_value()

            if not file_path:
                return Response(
                    "A result for exporting job was not found for finished RQ job",
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            with dm.util.get_export_cache_lock(file_path, ttl=REQUEST_TIMEOUT):
                if not osp.exists(file_path):
                    return Response(
                        "The exported file has expired, please retry exporting",
                        status=status.HTTP_404_NOT_FOUND,
                    )

                filename = self.export_args.filename or build_annotations_file_name(
                    class_name=self.resource,
                    identifier=(
                        self.db_instance.name
                        if isinstance(self.db_instance, (Task, Project))
                        else self.db_instance.id
                    ),
                    timestamp=instance_timestamp,
                    format_name=self.export_args.format,
                    is_annotation_file=not self.export_args.save_images,
                    extension=osp.splitext(file_path)[1],
                )

                rq_job.delete()
                return sendfile(
                    self.request,
                    file_path,
                    attachment=True,
                    attachment_filename=filename,
                )

        if rq_job.is_finished:
            if self.export_args.location == Location.CLOUD_STORAGE:
                rq_job.delete()
                return Response(status=status.HTTP_200_OK)

            elif self.export_args.location == Location.LOCAL:
                file_path = rq_job.return_value()

                if not file_path:
                    return Response(
                        "A result for exporting job was not found for finished RQ job",
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )

                with dm.util.get_export_cache_lock(file_path, ttl=REQUEST_TIMEOUT):
                    if osp.exists(file_path):
                        # Update last update time to prolong the export lifetime
                        # as the last access time is not available on every filesystem
                        os.utime(file_path, None)

                        return Response(status=status.HTTP_201_CREATED)
                    else:
                        # Cancel and reenqueue the job.
                        # The new attempt will be made after the last existing job.
                        # In the case the server is configured with ONE_RUNNING_JOB_IN_QUEUE_PER_USER
                        # we have to enqueue dependent jobs after canceling one.
                        rq_job.cancel(
                            enqueue_dependents=settings.ONE_RUNNING_JOB_IN_QUEUE_PER_USER
                        )
                        rq_job.delete()
            else:
                raise NotImplementedError(
                    f"Export to {self.export_args.location} location is not implemented yet"
                )
        elif rq_job.is_failed:
            exc_info = rq_job.meta.get("formatted_exception", str(rq_job.exc_info))
            rq_job.delete()
            return Response(exc_info, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif (
            rq_job.is_deferred
            and rq_job.id not in queue.deferred_job_registry.get_job_ids()
        ):
            # Sometimes jobs can depend on outdated jobs in the deferred jobs registry.
            # They can be fetched by their specific ids, but are not listed by get_job_ids().
            # Supposedly, this can happen because of the server restarts
            # (potentially, because the redis used for the queue is in memory).
            # Another potential reason is canceling without enqueueing dependents.
            # Such dependencies are never removed or finished,
            # as there is no TTL for deferred jobs,
            # so the current job can be blocked indefinitely.

            # Cancel the current job and then reenqueue it, considering the current situation.
            # The new attempt will be made after the last existing job.
            # In the case the server is configured with ONE_RUNNING_JOB_IN_QUEUE_PER_USER
            # we have to enqueue dependent jobs after canceling one.
            rq_job.cancel(enqueue_dependents=settings.ONE_RUNNING_JOB_IN_QUEUE_PER_USER)
            rq_job.delete()
        else:
            return Response(status=status.HTTP_202_ACCEPTED)

    def export(self) -> Response:
        if self.EXPORT_FOR == "audio":
            format_desc = { "ENABLED" : True }
        else:
            format_desc = {f.DISPLAY_NAME: f for f in dm.views.get_export_formats()}.get(
                self.export_args.format
            )
        if format_desc is None:
            raise serializers.ValidationError(
                "Unknown format specified for the request"
            )
        elif (self.EXPORT_FOR == "audio" and not format_desc["ENABLED"]) or (self.EXPORT_FOR != "audio" and not format_desc.ENABLED):
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)

        queue: DjangoRQ = django_rq.get_queue(self.QUEUE_NAME)
        rq_id = RQIdManager.build(
            "export",
            self.resource,
            self.db_instance.pk,
            subresource="dataset" if self.export_args.save_images else "annotations",
            anno_format=self.export_args.format,
            user_id=self.request.user.id,
        )

        rq_job = queue.fetch_job(rq_id)

        if rq_job:
            response = self.handle_rq_job(rq_job, queue)
            if response:
                return response

        self.setup_background_job(queue, rq_id)

        handle_dataset_export(
            self.db_instance,
            format_name=self.export_args.format,
            cloud_storage_id=self.export_args.location_config.get("storage_id"),
            save_images=self.export_args.save_images,
        )

        serializer = RqIdSerializer(data={"rq_id": rq_id})
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def setup_background_job(
        self,
        queue: DjangoRQ,
        rq_id: str,
    ) -> None:
        try:
            if self.request.scheme:
                server_address = self.request.scheme + "://"
            server_address += self.request.get_host()
        except Exception:
            server_address = None

        cache_ttl = dm.views.get_export_cache_ttl(self.db_instance)

        user_id = self.request.user.id

        func = self.export_callback
        func_args = (self.db_instance.id, self.export_args.format, server_address)
        result_url = None

        if self.export_args.location == Location.CLOUD_STORAGE:
            try:
                storage_id = self.export_args.location_config["storage_id"]
            except KeyError:
                raise serializers.ValidationError(
                    "Cloud storage location was selected as the destination,"
                    " but cloud storage id was not specified"
                )

            db_storage = get_cloud_storage_for_import_or_export(
                storage_id=storage_id,
                request=self.request,
                is_default=self.export_args.location_config["is_default"],
            )
            instance_update_time = self.get_instance_update_time()
            instance_timestamp = self.get_timestamp(instance_update_time)
            filename_pattern = build_annotations_file_name(
                class_name=self.db_instance.__class__.__name__,
                identifier=(
                    self.db_instance.name
                    if isinstance(self.db_instance, (models.Task, models.Project))
                    else self.db_instance.id
                ),
                timestamp=instance_timestamp,
                format_name=self.export_args.format,
                is_annotation_file=not self.export_args.save_images,
            )
            func = export_resource_to_cloud_storage
            func_args = (
                db_storage,
                self.export_args.filename,
                filename_pattern,
                self.export_callback,
            ) + func_args
        else:
            db_storage = None
            result_url = self.make_result_url()

        with get_rq_lock_by_user(queue, user_id):
            queue.enqueue_call(
                func=func,
                args=func_args,
                job_id=rq_id,
                meta=get_rq_job_meta(
                    request=self.request, db_obj=self.db_instance, result_url=result_url
                ),
                depends_on=define_dependent_job(queue, user_id, rq_id=rq_id),
                result_ttl=cache_ttl.total_seconds(),
                failure_ttl=cache_ttl.total_seconds(),
            )

    def get_v1_endpoint_view_name(self) -> str:
        """
        Get view name of the endpoint for the first API version

        Possible view names:
            - project-dataset
            - task|job-dataset-export
            - project|task|job-annotations
        """
        if self.export_args.save_images:
            template = "{}-dataset" + ("-export" if self.resource != "project" else "")
        else:
            template = "{}-annotations"

        return template.format(self.resource)


class BackupExportManager(_ResourceExportManager):
    SUPPORTED_RESOURCES = {"project", "task"}

    @dataclass
    class ExportArgs:
        filename: str
        location_config: Dict[str, Any]

        @property
        def location(self) -> Location:
            return self.location_config["location"]

    def __init__(
        self,
        db_instance: Union[models.Project, models.Task],
        request: HttpRequest,
        *,
        version: int = 2,
    ) -> None:
        super().__init__(version, db_instance, export_callback=create_backup)
        self.request = request

        filename = request.query_params.get("filename", "")
        location_config = get_location_configuration(
            db_instance=self.db_instance,
            query_params=self.request.query_params,
            field_name=StorageType.TARGET,
        )
        self.export_args = self.ExportArgs(filename, location_config)

    def _handle_rq_job_v1(
        self,
        rq_job: RQJob,
        queue: DjangoRQ,
    ) -> Optional[Response]:
        last_instance_update_time = timezone.localtime(self.db_instance.updated_date)
        timestamp = self.get_timestamp(last_instance_update_time)

        action = self.request.query_params.get("action")

        if action not in (None, "download"):
            raise serializers.ValidationError(
                "Unexpected action specified for the request"
            )

        if action == "download":
            if self.export_args.location != Location.LOCAL:
                return Response(
                    'Action "download" is only supported for a local backup location',
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not rq_job.is_finished:
                return Response(
                    "Backup has not finished", status=status.HTTP_400_BAD_REQUEST
                )

            file_path = rq_job.return_value()

            if not file_path:
                return Response(
                    "A result for exporting job was not found for finished RQ job",
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            elif not os.path.exists(file_path):
                return Response(
                    "The result file does not exist in export cache",
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            filename = self.export_args.filename or build_backup_file_name(
                class_name=self.resource,
                identifier=self.db_instance.name,
                timestamp=timestamp,
                extension=os.path.splitext(file_path)[1],
            )

            rq_job.delete()
            return sendfile(
                self.request, file_path, attachment=True, attachment_filename=filename
            )

        if rq_job.is_finished:
            if self.export_args.location == Location.LOCAL:
                return Response(status=status.HTTP_201_CREATED)

            elif self.export_args.location == Location.CLOUD_STORAGE:
                rq_job.delete()
                return Response(status=status.HTTP_200_OK)
            else:
                raise NotImplementedError()
        elif rq_job.is_failed:
            exc_info = rq_job.meta.get("formatted_exception", str(rq_job.exc_info))
            rq_job.delete()
            return Response(exc_info, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        elif (
            rq_job.is_deferred
            and rq_job.id not in queue.deferred_job_registry.get_job_ids()
        ):
            # Sometimes jobs can depend on outdated jobs in the deferred jobs registry.
            # They can be fetched by their specific ids, but are not listed by get_job_ids().
            # Supposedly, this can happen because of the server restarts
            # (potentially, because the redis used for the queue is in memory).
            # Another potential reason is canceling without enqueueing dependents.
            # Such dependencies are never removed or finished,
            # as there is no TTL for deferred jobs,
            # so the current job can be blocked indefinitely.

            # Cancel the current job and then reenqueue it, considering the current situation.
            # The new attempt will be made after the last existing job.
            # In the case the server is configured with ONE_RUNNING_JOB_IN_QUEUE_PER_USER
            # we have to enqueue dependent jobs after canceling one.
            rq_job.cancel(enqueue_dependents=settings.ONE_RUNNING_JOB_IN_QUEUE_PER_USER)
            rq_job.delete()
        else:
            return Response(status=status.HTTP_202_ACCEPTED)

    def export(self) -> Response:
        queue: DjangoRQ = django_rq.get_queue(self.QUEUE_NAME)
        rq_id = RQIdManager.build(
            "export",
            self.resource,
            self.db_instance.pk,
            subresource="backup",
            user_id=self.request.user.id,
        )
        rq_job = queue.fetch_job(rq_id)

        if rq_job:
            response = self.handle_rq_job(rq_job, queue)
            if response:
                return response

        self.setup_background_job(queue, rq_id)
        serializer = RqIdSerializer(data={"rq_id": rq_id})
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)

    def setup_background_job(
        self,
        queue: DjangoRQ,
        rq_id: str,
    ) -> None:
        if isinstance(self.db_instance, Task):
            logger = slogger.task[self.db_instance.pk]
            Exporter = TaskExporter
            cache_ttl = dm.views.TASK_CACHE_TTL
        else:
            logger = slogger.project[self.db_instance.pk]
            Exporter = ProjectExporter
            cache_ttl = dm.views.PROJECT_CACHE_TTL

        func = self.export_callback
        func_args = (
            self.db_instance,
            Exporter,
            "{}_backup.zip".format(self.resource),
            logger,
            cache_ttl,
        )
        result_url = None

        if self.export_args.location == Location.CLOUD_STORAGE:
            try:
                storage_id = self.export_args.location_config["storage_id"]
            except KeyError:
                raise serializers.ValidationError(
                    "Cloud storage location was selected as the destination,"
                    " but cloud storage id was not specified"
                )

            db_storage = get_cloud_storage_for_import_or_export(
                storage_id=storage_id,
                request=self.request,
                is_default=self.export_args.location_config["is_default"],
            )

            last_instance_update_time = timezone.localtime(
                self.db_instance.updated_date
            )
            timestamp = self.get_timestamp(last_instance_update_time)

            filename_pattern = build_backup_file_name(
                class_name=self.resource,
                identifier=self.db_instance.name,
                timestamp=timestamp,
            )
            func = export_resource_to_cloud_storage
            func_args = (
                db_storage,
                self.export_args.filename,
                filename_pattern,
                self.export_callback,
            ) + func_args
        else:
            result_url = self.make_result_url()

        user_id = self.request.user.id

        with get_rq_lock_by_user(queue, user_id):
            queue.enqueue_call(
                func=func,
                args=func_args,
                job_id=rq_id,
                meta=get_rq_job_meta(
                    request=self.request, db_obj=self.db_instance, result_url=result_url
                ),
                depends_on=define_dependent_job(queue, user_id, rq_id=rq_id),
                result_ttl=cache_ttl.total_seconds(),
                failure_ttl=cache_ttl.total_seconds(),
            )

    def get_v1_endpoint_view_name(self) -> str:
        """Get view name of the endpoint for the first API version"""

        return f"{self.resource}-export-backup"


class GroundTruthBackgroundJob:
    QUEUE_NAME = settings.CVAT_QUEUES.GT_JOBS.value

    @staticmethod
    def get_queue():
        return django_rq.get_queue(GroundTruthBackgroundJob.QUEUE_NAME)

    @staticmethod
    def get_rq_id(task_id):
        rq_id = RQIdManager.build('create', 'gt_job', task_id)
        return rq_id

    @staticmethod
    def create_gt_job_task(task_id, validated_data):
        """Background task to create a Ground Truth job."""

        rq_job = get_current_job()
        if rq_job:
            rq_job.meta[RQJobMetaField.STATUS] = 'STARTED'
            rq_job.meta[RQJobMetaField.PROGRESS] = 0
            rq_job.save_meta()

        try:
            with transaction.atomic():
                task = models.Task.objects.select_for_update().get(pk=task_id)

                if not task.data:
                    raise AttributeError(
                        "Task data is missing. Please set up task data."
                    )
                if task.dimension != models.DimensionType.DIM_2D:
                    raise TypeError("Ground Truth jobs are only supported in 2D tasks.")

                size = task.data.size
                valid_frame_ids = task.data.get_valid_frame_indices()

                frame_selection_method = validated_data.pop("frame_selection_method", None)
                frames = []
                time_stamps = []

                if frame_selection_method == models.JobFrameSelectionMethod.RANDOM_UNIFORM:
                    frame_count = validated_data.pop("frame_count")
                    if size < frame_count:
                        raise ValueError(
                            f"Requested frame count ({frame_count}) exceeds task frame count ({size})."
                        )

                    if task.data.original_chunk_type == DataChoice.AUDIO:
                        jobs = models.Job.objects.select_related("segment").filter(segment__task_id=task_id).order_by('id')
                        audio_processor = AudioSegmentHandler(task.data.get_data_dirname())
                        percentage = math.ceil((frame_count*100)/size)

                        frames = []
                        time_stamps = []
                        job_segments = {}

                        frames_per_millisecond_list = [
                            frames / duration if duration else 0
                            for frames, duration in zip(task.total_frames_count, task.audio_total_duration)
                        ]

                        for index, job in enumerate(jobs):
                            audio_index = job.segment.audio_file_index
                            job_start_frame = job.segment.start_frame
                            job_stop_frame = job.segment.stop_frame
                            job_frame_count = job_stop_frame - job_start_frame + 1

                            if audio_index is None or audio_index >= len(frames_per_millisecond_list):
                                raise ValueError("Missing or invalid audio_file_index in segment")

                            frames_per_millisecond = frames_per_millisecond_list[audio_index]
                            total_frames_in_audio = task.total_frames_count[audio_index]

                            job_duration_seconds = (job_frame_count / frames_per_millisecond) / 1000
                            gt_job_duration = math.floor((job_duration_seconds * percentage) / 100)

                            min_duration = 0.1  # 100 milliseconds of pause between segments
                            segments = audio_processor.get_audio_segments(index, min_duration=min_duration)
                            used_segments = []

                            if segments:
                                start_time_sec = segments[0][0]
                                end_time_sec = segments[0][1]

                                for segment in segments:
                                    segment_end_sec = segment[1]
                                    used_segments.append(segment)

                                    if (segment_end_sec - start_time_sec) > gt_job_duration:
                                        end_time_sec = segment_end_sec
                                        break
                                    else:
                                        end_time_sec = segment_end_sec

                                if end_time_sec:
                                    segment_start_time_ms = 0
                                    segment_end_time_ms = int(min(end_time_sec * 1000, task.audio_total_duration[audio_index]))

                                    absolute_start_frame = job_start_frame
                                    absolute_stop_frame = job_start_frame + int(segment_end_time_ms * frames_per_millisecond)

                                    frames.extend(range(absolute_start_frame, absolute_stop_frame))
                                    time_stamps.extend([segment_start_time_ms, segment_end_time_ms])
                            else:
                                time_stamps.extend([0, 0])

                            job_segments[index] = used_segments


                        def save_concatenated_gt_audio_chunks(time_stamps: list, output_directory: str):
                            number_of_jobs = len(time_stamps) // 2
                            output_file_path = os.path.join(output_directory, f"{number_of_jobs}.mp3")

                            try:
                                if os.path.exists(output_file_path):
                                    os.remove(output_file_path)

                                input_args = []
                                filter_complex_parts = []
                                output_stream_labels = []

                                for job_index in range(number_of_jobs):
                                    input_file_path = os.path.join(output_directory, f"{job_index}.mp3")

                                    if not os.path.exists(input_file_path):
                                        continue

                                    duration_ms = time_stamps[job_index * 2 + 1]

                                    if duration_ms <= 0:
                                        continue

                                    duration_sec = duration_ms / 1000.0

                                    input_args.extend(['-i', input_file_path])

                                    # Define the 'atrim' (audio trim) and 'asetpts' (reset timestamps) filters
                                    # [job_index:a] refers to the audio stream of the current input file
                                    # [a{job_index}] creates a unique label for this processed stream
                                    filter_complex_parts.append(f"[{job_index}:a]atrim=duration={duration_sec},asetpts=PTS-STARTPTS[a{job_index}]")
                                    output_stream_labels.append(f"[a{job_index}]")

                                if not input_args:
                                    return

                                # Construct the 'concat' filter string
                                # It takes all labeled output streams (e.g., [a0][a1]...)
                                # n=X:v=0:a=1 specifies X input streams, 0 video outputs, 1 audio output
                                # [out] is the final output label for the concatenated audio
                                concat_filter_chain = ''.join(output_stream_labels) + f"concat=n={len(output_stream_labels)}:v=0:a=1[out]"
                                filter_complex_parts.append(concat_filter_chain)

                                full_filter_complex_string = ';'.join(filter_complex_parts)

                                command = [
                                    'ffmpeg',
                                    *input_args,                           # All input files
                                    '-filter_complex', full_filter_complex_string, # The combined filter graph
                                    '-map', '[out]',                       # Map the output of our filter graph to the final file
                                    '-acodec', 'libmp3lame',               # Use LAME encoder for MP3
                                    '-b:a', '192k',                        # Set audio bitrate to 192 kbps
                                    '-y',                                  # Overwrite output file if it exists
                                    output_file_path                       # Final output file path
                                ]

                                subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                                # create peaks for gt jobs
                                original_chunk_writer = AudioChunkWriter()
                                original_chunk_writer.generate_and_normalize_waveform(output_file_path, task.data.get_peaks_path(number_of_jobs))

                            except subprocess.CalledProcessError as e:
                                raise RuntimeError(f"FFmpeg Error: {e.stderr.decode('utf8')}") from e
                            except FileNotFoundError:
                                raise RuntimeError("FFmpeg not found. Ensure FFmpeg is installed and in your system's PATH.")
                            except Exception as e:
                                raise RuntimeError(f"An error occurred during audio processing: {e}") from e

                        save_concatenated_gt_audio_chunks(time_stamps, task.data.get_compressed_cache_dirname())
                    else:
                        seed = validated_data.pop("seed", None)
                        from numpy import random
                        rng = random.Generator(random.MT19937(seed=seed))

                        if seed is not None and frame_count < size:
                            valid_frame_ids = [v for v in valid_frame_ids if v != task.data.stop_frame]

                        frames = rng.choice(
                            list(valid_frame_ids), size=frame_count, shuffle=False, replace=False
                        ).tolist()
                elif frame_selection_method == models.JobFrameSelectionMethod.MANUAL:
                    frames = validated_data.pop("frames")

                    if not frames:
                        raise ValueError("Frame list cannot be empty.")

                    unique_frames = set(frames)
                    if len(unique_frames) != len(frames):
                        raise ValueError("Frame list contains duplicate entries.")

                    invalid_ids = unique_frames.difference(valid_frame_ids)
                    if invalid_ids:
                        raise IndexError(
                            "Frame list contains invalid frame IDs."
                        )
                else:
                    raise NotImplementedError(f"Frame selection method '{frame_selection_method}' is not implemented.")

                segment = models.Segment.objects.create(
                    start_frame=0,
                    stop_frame=task.data.size - 1,
                    frames=frames,
                    task=task,
                    type=models.SegmentType.SPECIFIC_FRAMES,
                    time_stamps=time_stamps,
                )

                validated_data['segment'] = segment

                gt_job = models.Job.objects.create(
                    **validated_data
                )

                # save annotations if gt job
                # if validated_data["type"] == models.JobType.GROUND_TRUTH:
                #     for segments in relative_segments:
                #         for start, end in segments:
                #             models.LabeledShape.objects.create(
                #                 job=gt_job,
                #                 label=task.project.get_labels().first(), # labels are in project
                #                 frame=0,
                #                 source='manual',
                #                 type='rectangle',
                #                 points=[start, start, end, end],
                #             )

                gt_job.make_dirs()

                if rq_job:
                    rq_job.meta[RQJobMetaField.STATUS] = 'COMPLETED'
                    rq_job.meta[RQJobMetaField.PROGRESS] = 100
                    rq_job.save_meta()

        except Exception as e:
            if rq_job:
                rq_job.meta[RQJobMetaField.STATUS] = 'FAILED'
                rq_job.meta['error_message'] = str(e)
                rq_job.save_meta()
            slogger.glob.error(f"Error creating Ground Truth job for task {task_id}: {type(e).__name__} - {e}", exc_info=True)
            # Optionally, you might want to re-raise the exception or perform other error handling
            # raise # re-raise the exception.