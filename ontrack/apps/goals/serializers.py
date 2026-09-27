"""DRF serializers for goals, items, and progress logs."""
from rest_framework import serializers

from apps.goals.models import Goal, GoalItem, ProgressLog


class GoalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalItem
        fields = ["id", "title", "completed"]


class GoalSerializer(serializers.ModelSerializer):
    items = GoalItemSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = [
            "id", "title", "goal_type", "target", "domain", "status",
            "deadline", "start_at", "result_value", "finished_at",
            "parse_result", "verdict", "items",
        ]
        read_only_fields = fields


class ProgressLogSerializer(serializers.ModelSerializer):
    goal_id = serializers.UUIDField(source="goal.id", read_only=True)

    class Meta:
        model = ProgressLog
        fields = ["id", "goal_id", "value", "note", "logged_at"]
        read_only_fields = fields
