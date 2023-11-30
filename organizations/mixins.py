from unittest import mock
from rest_framework import mixins, status

class PartialUpdateModelMixin:
    """
    Update fields of a model instance.

    Almost the same as UpdateModelMixin, but has no public PUT / update() method.
    """

    def _update(self, request, *args, **kwargs):
        # This method must not be named "update" not to be matched with the PUT method
        # print(  "request--upate", request)
        return mixins.UpdateModelMixin.update(self, request, *args, **kwargs)

    def perform_update(self, serializer):
        # print("serializer--", serializer.instance)
        mixins.UpdateModelMixin.perform_update(self, serializer=serializer)

    def partial_update(self, request, *args, **kwargs):
        with mock.patch.object(self, 'update', new=self._update, create=True):
            return mixins.UpdateModelMixin.partial_update(self, request=request, *args, **kwargs)
