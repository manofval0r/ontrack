"""DRF serializers for goals, items, and progress logs."""
from rest_framework import serializers

from apps.goals.models import Goal, GoalItem, ProgressLog


class GoalItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoalItem
        fields = ["id", "title", "completed"]


class ProgressLogSerializer(serializers.ModelSerializer):
    goal_id = serializers.UUIDField(source="goal.id", read_only=True)

    class Meta:
        model = ProgressLog
        fields = ["id", "goal_id", "value", "note", "logged_at"]
        read_only_fields = fields


class GoalSerializer(serializers.ModelSerializer):
    items = GoalItemSerializer(many=True, read_only=True)
    progress_logs = ProgressLogSerializer(many=True, read_only=True)
    current_value = serializers.SerializerMethodField()
    unit = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            "id", "title", "goal_type", "goal_template", "target", "domain", "status",
            "deadline", "start_at", "result_value", "finished_at",
            "parse_result", "verdict", "items", "progress_logs", "current_value",
            "unit", "description",
        ]
        read_only_fields = fields

    def get_current_value(self, obj):
        if obj.goal_type == Goal.GOAL_TYPE_CHECKLIST:
            return sum(1 for item in obj.items.all() if item.completed)
        if obj.goal_type == Goal.GOAL_TYPE_COUNTER:
            return sum(log.value for log in obj.progress_logs.all())
        if obj.goal_type == Goal.GOAL_TYPE_MANUAL:
            return obj.progress_logs.count()
        return 0

    def get_unit(self, obj):
        if isinstance(obj.parse_result, dict):
            return obj.parse_result.get("unit") or ""
        return ""

    def get_description(self, obj):
        if isinstance(obj.parse_result, dict):
            return obj.parse_result.get("summary") or obj.parse_result.get("description") or ""
        return ""
