from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from .views import CustomAuthToken
from .views import logout_user
from .views import register
from .views import show_current_user
from .views import show_users
from .views import user_by_id

urlpatterns = [
    path("auth/login", CustomAuthToken.as_view(), name="login"),
    path("auth/register", register, name="register"),
    path("auth/logout", logout_user, name="logout"),
    path("users", show_users, name="show_users"),
    path("users/self", show_current_user, name="show_current_user"),
    path("users/<user_id>", user_by_id, name="user_by_id"),
]
urlpatterns = format_suffix_patterns(urlpatterns)
