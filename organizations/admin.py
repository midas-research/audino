from .models import *
from django.contrib import admin

class OrganizationAdmin(admin.ModelAdmin):
    model = Organization
    search_fields = ('slug', 'type')
    list_display = ('id', 'slug', 'name')

admin.site.register(Organization)
admin.site.register(Invitation)
admin.site.register(Membership)
