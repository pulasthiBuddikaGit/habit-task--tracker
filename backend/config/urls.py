from django.contrib import admin
from django.urls import path, include
from habits.views import CookieTokenObtainPairView, CookieTokenRefreshView, LogoutView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/", include("habits.urls")),

    path("api/auth/login/", CookieTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", CookieTokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="logout"),
]
