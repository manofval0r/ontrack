from django.urls import path

from .views import (
    ChatParseGoalView,
    CheckinRespondView,
    DashboardView,
    GoalCheckinView,
    GoalDetailView,
    GoalFinalizeView,
    GoalListCreateView,
    ProgressCreateView,
)
from api.chat import ChatView

urlpatterns = [
    path("goals", GoalListCreateView.as_view(), name="goal-list-create"),
    path("goals/<uuid:goal_id>", GoalDetailView.as_view(), name="goal-detail"),
    path("goals/<uuid:goal_id>/checkin", GoalCheckinView.as_view(), name="goal-checkin"),
    # Spec aliases (frontend contract): plural + explicit action names.
    path("goals/<uuid:goal_id>/checkins/generate", GoalCheckinView.as_view(), name="goal-checkin-generate"),
    path(
        "goals/<uuid:goal_id>/checkins/<uuid:checkin_id>/respond",
        CheckinRespondView.as_view(),
        name="goal-checkin-respond",
    ),
    path("goals/<uuid:goal_id>/finalize", GoalFinalizeView.as_view(), name="goal-finalize"),
    path("progress", ProgressCreateView.as_view(), name="progress-create"),
    path("dashboard", DashboardView.as_view(), name="dashboard"),
    path("chat", ChatView.as_view(), name="chat"),
    path("chat/message", ChatView.as_view(), name="chat-message"),
    path("chat/parse-goal", ChatParseGoalView.as_view(), name="chat-parse-goal"),
]
