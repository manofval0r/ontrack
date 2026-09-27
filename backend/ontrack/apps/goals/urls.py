from django.urls import path

from apps.goals.views import (
    DashboardView,
    GoalCheckinView,
    GoalDetailView,
    GoalFinalizeView,
    GoalListCreateView,
    ProgressCreateView,
)

urlpatterns = [
    path("goals", GoalListCreateView.as_view(), name="goal-list-create"),
    path("goals/<uuid:goal_id>", GoalDetailView.as_view(), name="goal-detail"),
    path("goals/<uuid:goal_id>/checkin", GoalCheckinView.as_view(), name="goal-checkin"),
    path("goals/<uuid:goal_id>/finalize", GoalFinalizeView.as_view(), name="goal-finalize"),
    path("progress", ProgressCreateView.as_view(), name="progress-create"),
    path("dashboard", DashboardView.as_view(), name="dashboard"),
]
