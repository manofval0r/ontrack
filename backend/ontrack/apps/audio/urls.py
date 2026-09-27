from django.urls import path

from .views import AsrView, TtsView

urlpatterns = [
    path("tts", TtsView.as_view(), name="tts"),
    path("asr", AsrView.as_view(), name="asr"),
]
