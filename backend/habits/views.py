from django.shortcuts import render

# Create your views here.
from django.db import IntegrityError
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Habit, Completion
from .serializers import HabitSerializer, RegisterSerializer


REFRESH_TOKEN_COOKIE_NAME = "refresh_token"
REFRESH_TOKEN_COOKIE_MAX_AGE = 24 * 60 * 60


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CookieTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]

        response = Response({"access": access_token}, status=status.HTTP_200_OK)
        # Store the refresh token in an HttpOnly cookie so frontend JavaScript cannot read it.
        response.set_cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            refresh_token,
            max_age=REFRESH_TOKEN_COOKIE_MAX_AGE,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/api/auth/",
        )
        return response


class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Read the refresh token only from the HttpOnly cookie, not from the request body.
        refresh_token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if not refresh_token:
            return Response(
                {"detail": "Refresh token cookie is missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            token = RefreshToken(refresh_token)
        except TokenError:
            return Response(
                {"detail": "Refresh token is invalid or expired."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({"access": str(token.access_token)}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response(
            {"detail": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
        # Delete the HttpOnly refresh cookie on the backend-controlled auth path.
        response.delete_cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            path="/api/auth/",
            samesite="Lax",
        )
        return response


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
