from django.urls import path

from .integrations import (
    IntegrationDetailView,
    IntegrationListCreateView,
    NotionExportView,
    SlackNotifyView,
)
from .views import AuthMeView, SettingsView

urlpatterns = [
    path("auth/me", AuthMeView.as_view(), name="auth-me"),
    path("settings", SettingsView.as_view(), name="settings"),
    path("integrations", IntegrationListCreateView.as_view(), name="integration-list-create"),
    path("integrations/<uuid:integration_id>", IntegrationDetailView.as_view(), name="integration-detail"),
    path("integrations/slack/notify", SlackNotifyView.as_view(), name="integration-slack-notify"),
    path("integrations/notion/export", NotionExportView.as_view(), name="integration-notion-export"),
]
