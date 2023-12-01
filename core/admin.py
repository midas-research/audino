from django.contrib import admin

from .models import *

admin.site.register(Label)
admin.site.register(Project)
admin.site.register(Storage)
admin.site.register(Attribute)
admin.site.register(Task)
admin.site.register(Data)
admin.site.register(Job)
admin.site.register(Annotation)
admin.site.register(AnnotationData)
admin.site.register(AnnotationAttribute)
