from core.utils import get_paginator
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes
from rest_framework.decorators import permission_classes
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .manager import TokenAuthentication
from .models import User
from .serializers import GetUserSerializer
from .serializers import UserSerializer
from .serializers import UserSignUpSerializer


class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        # Determine whether the input data contains an email or a username
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        if not (username or email) or not password:
            return Response({"error": "Please enter valid value"}, status=400)

        # Attempt to authenticate with either username or email
        user = None
        if email:  # If "@" is present, consider it an email
            user = User.objects.filter(email=email).first()
        else:
            user = User.objects.filter(username=username).first()

        if user is None:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if user is None or not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=400)

        # Generate or retrieve an authentication token for the user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({"key": token.key})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request, format=None):
    serializer = UserSignUpSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def logout_user(request, format=None):
    try:
        request.user.auth_token.delete()
    except User.DoesNotExist:
        return Response(
            {"message": "Auth Token doesn't exist!"}, status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {"message": "User Logged out Successfully !"}, status=status.HTTP_200_OK
    )


@api_view(["PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def edit_details(request, format=None):
    try:
        auth_user = User.objects.get(email=request.user.email)
    except User.DoesNotExist:
        return Response(
            {"error": "User doesn't exist in the Database"},
            status=status.HTTP_404_NOT_FOUND,
        )

    data = JSONParser().parse(request)
    data["user"] = auth_user
    serializer = UserSerializer(auth_user, data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def show_current_user(request, format=None):
    try:
        auth_user = User.objects.get(email=request.user.email)
    except User.DoesNotExist:
        return Response(
            {"error": "User doesn't exist in the Database"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "PATCH":
        data = JSONParser().parse(request)
        serializer = UserSerializer(auth_user, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserSerializer(auth_user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def show_users(request, format=None):
    page = request.GET.get("page", 1)
    page_size = request.GET.get("page_size", 1)
    paginator = get_paginator(page, page_size)

    all_users = User.objects.all()
    results = paginator.paginate_queryset(all_users, request)
    serialized_data = UserSerializer(results, many=True)
    return paginator.get_paginated_response(serialized_data.data)


@api_view(["GET", "DELETE"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_by_id(request, user_id, format=None):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"message": "User Does not Exist."}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "DELETE":
        user.delete()
        return Response(
            {"message": "User Deleted Successfully!!"}, status=status.HTTP_200_OK
        )

    serializer = GetUserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)
