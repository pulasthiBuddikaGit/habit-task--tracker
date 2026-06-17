from django.contrib import admin
from .models import Habit, Completion


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "user", "is_active", "created_at"]
    search_fields = ["title", "user__username"]
    list_filter = ["is_active", "created_at"]


@admin.register(Completion)
class CompletionAdmin(admin.ModelAdmin):
    list_display = ["id", "habit", "completed_date", "created_at"]
    search_fields = ["habit__title"]
    list_filter = ["completed_date", "created_at"]