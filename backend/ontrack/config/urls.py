"""Root URL configuration."""
from django.urls import include, path

from config.views import DebugView, HealthView

urlpatterns = [
    path("api/health", HealthView.as_view(), name="health"),
    path("api/debug", DebugView.as_view(), name="debug"),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.goals.urls")),
    path("api/", include("apps.audio.urls")),
]
