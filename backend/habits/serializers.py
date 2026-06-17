from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import Habit, Completion


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Completion
        fields = ["id", "completed_date", "created_at"]


class HabitSerializer(serializers.ModelSerializer):
    completions = CompletionSerializer(many=True, read_only=True)
    streak_count = serializers.SerializerMethodField()
    is_completed_today = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = [
            "id",
            "title",
            "description",
            "is_active",
            "created_at",
            "updated_at",
            "completions",
            "streak_count",
            "is_completed_today",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    #1. Is this habit completed today?
    def get_is_completed_today(self, obj):
        today = timezone.localdate()
        #Does this habit have a completion record for today?
        return obj.completions.filter(completed_date=today).exists()

    #2. How many consecutive days has this habit been completed?
    #This gets all completed dates for that habit.
    def get_streak_count(self, obj):
        #The code converts them into a set:
        completed_dates = set(
            obj.completions.values_list("completed_date", flat=True)
        )

        #If there are no completed dates, the streak count is 0.
        if not completed_dates:
            return 0

        today = timezone.localdate()

        # If completed today, count backwards from today.
        # If not completed today, count backwards from yesterday.
        if today in completed_dates:
            current_date = today
        else:
            current_date = today - timedelta(days=1)

        streak = 0

        while current_date in completed_dates:
            streak += 1
            current_date -= timedelta(days=1)

        return streak