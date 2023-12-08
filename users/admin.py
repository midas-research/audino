from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField

from .models import User


# Register your models here.
class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(
        label="Confirm Password", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "username")

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ("username", "email", "password",
                  "first_name", "last_name",)

    def clean_password(self):
        return self.initial["password"]


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "get_groups",
    )
    list_filter = ("email","groups",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "username",
                    "password",
                )
            },
        ),
        (
            "Information",
            {
                "fields": (
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_admin",
                    "is_superuser",
                    "groups",
                )
            },
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "username",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "groups",
                ),
            },
        ),
    )
    search_fields = (
        "email",
        "username",
        "first_name",
    )
    ordering = ("email",)
    filter_horizontal = ("groups",)


# class UserDetailAdmin(BaseUserAdmin):
#     model = User

#     list_display = ("user", "age", "first_name", "last_name", "mobile_no",)
#     list_filter = ("user", "gender",)
#     fieldsets = (
#         (None, {"fields": ("user",)}),
#         ("Personal Information", {"fields": ("age", "gender", "first_name", "last_name", "mobile_no",)})
#     )
#     search_fields = ("user",)
#     ordering = ("user",)
#     filter_horizontal = ()

    def get_groups(self, obj):
        return ", ".join([group.name for group in obj.groups.all()])

    get_groups.short_description = "Groups" 

admin.site.register(User, UserAdmin)
# admin.site.register(UserDetail, UserDetailAdmin)
