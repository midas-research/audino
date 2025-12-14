from django.contrib import admin

from .models import *
# Register your models here.


class NotificationsAdmin(admin.ModelAdmin):
    model = Notifications


admin.site.register(Notifications, NotificationsAdmin)


class NotificationStatusAdmin(admin.ModelAdmin):
    model = NotificationStatus


admin.site.register(NotificationStatus, NotificationStatusAdmin)