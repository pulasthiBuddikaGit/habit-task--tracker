from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import HabitViewSet, RegisterView

router = DefaultRouter()
router.register("habits", HabitViewSet, basename="habit")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("", include(router.urls)),
]