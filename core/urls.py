from django.urls import path
from django.urls.conf import include
from rest_framework.routers import DefaultRouter
from .views import *
from .views import ProjectViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'projects', ProjectViewSet)

# urlpatterns = router.urls
urlpatterns = [
    path('', include(router.urls)),
    # path("projects", get_add_project, name="get_add_project"),
    # path("projects/<id>", update_project, name="update_project"),
    path("labels", get_labels, name="get_labels"),
    path("labels/<id>", get_label_by_id, name="get_label_by_id"),
    path("tasks", tasks, name="tasks"),
    path("tasks/<task_id>", get_task_by_id, name="get_task_by_id"),
    path("tasks/<task_id>/data", add_data, name="add_data"),
    path("jobs", jobs, name="jobs"),
    path("jobs/<job_id>", get_job_by_id, name="get_job_by_id"),
    path("jobs/<job_id>/annotation", job_annotation, name="job_annotation"),
    path("jobs/<job_id>/annotation/<a_id>", annotations, name="annotations"),
]
