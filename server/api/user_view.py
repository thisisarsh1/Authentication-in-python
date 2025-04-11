from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import MultiPartParser, FormParser
import jwt
from .models import User
from .serializer import StudentSerializer, CompanySerializer

class UserView(APIView):
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads

    @csrf_exempt
    def get(self, request):
        token = request.headers.get('Authorization')

        if not token:
            raise AuthenticationFailed('Unauthenticated!')

        try:
            payload = jwt.decode(token, 'secret', algorithms="HS256")
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token expired!", "is_expired": True}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token!')

        user = User.objects.filter(id=payload['id']).first()
        serializer = CompanySerializer(user) if user.is_company else StudentSerializer(user)

        return Response(serializer.data)

    def patch(self, request):
        token = request.headers.get('Authorization')

        if not token:
            raise AuthenticationFailed('Unauthenticated!')

        try:
            payload = jwt.decode(token, 'secret', algorithms="HS256")
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired!')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token!')

        user = User.objects.filter(id=payload['id']).first()

        if not user:
            return Response({'error': 'User not found!'}, status=status.HTTP_404_NOT_FOUND)

        # Handle profile image update
        if 'profile_image' in request.FILES:
            user.profile_image = request.FILES['profile_image']
            user.save()
            return Response({'message': 'Profile image updated successfully!'}, status=status.HTTP_200_OK)

        return Response({'error': 'No profile image provided!'}, status=status.HTTP_400_BAD_REQUEST)
