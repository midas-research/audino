from django.contrib import admin

from .models import Annotation
from .models import AnnotationAttribute
from .models import AnnotationData
from .models import Attribute
from .models import Data
from .models import Job
from .models import Label
from .models import Project
from .models import Storage
from .models import Task

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
