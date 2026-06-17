from django.shortcuts import render

# Create your views here.
from django.db import IntegrityError
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Habit, Completion
from .serializers import HabitSerializer, RegisterSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]

    #bcz we want to return only the habits of the logged-in user, we override the get_queryset method:
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    #This is a custom action that allows users to mark a habit as completed for the current day.
    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        #This gets the habit from the URL(Payload or URL header).
        selected_habit  = self.get_object()
        today = timezone.localdate()

        #COre business rule (1. A user can only mark a habit as completed once per day.)
        # These two values check whether there is already a completion in the database for the selected habit and today’s date. 
        # If both match an existing completion record, Django returns that existing completion and 'created' becomes False. 
        # If no matching completion exists, Django creates a new completion with that habit and today’s date, and 'created' becomes True.
        try:
            completion, created = Completion.objects.get_or_create(
                #This 'habit' contains one Habit(Table) object.
                habit=selected_habit ,
                completed_date=today
            )
        # in rare cases, maybe two requests happen at the exact same time:
        #The database will allow only one and reject the other.
        # That rejection can raise IntegrityError.
        except IntegrityError:
            return Response(
                {"detail": "This habit is already completed today."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # False means the completion already exists, True means it was created now.
        if not created:
            return Response(
                {
                    "detail": "This habit is already completed today.",
                    "habit": self.get_serializer(selected_habit).data,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "detail": "Habit completed successfully.",
                "habit": self.get_serializer(selected_habit).data,
            },
            status=status.HTTP_201_CREATED
        )