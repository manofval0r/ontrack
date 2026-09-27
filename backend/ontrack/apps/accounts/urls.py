from django.urls import path

from apps.accounts.views import AuthMeView, SettingsView

urlpatterns = [
    path("auth/me", AuthMeView.as_view(), name="auth-me"),
    path("settings", SettingsView.as_view(), name="settings"),
]
