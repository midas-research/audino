from rest_framework.routers import DefaultRouter
from .views import InvitationViewSet, MembershipViewSet, OrganizationViewSet

router = DefaultRouter(trailing_slash=True)
router.register(r'organizations', OrganizationViewSet)
router.register(r'invitations', InvitationViewSet)
router.register(r'memberships', MembershipViewSet)

urlpatterns = router.urls
