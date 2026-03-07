from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import Book
from .serializers import BookSerializer

@api_view(['GET'])
def get_books(request):
    books = Book.objects.all()
    serializer = BookSerializer(books, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Username and password cannot be empty!"}, status=400)
        
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists, please choose another one!"}, status=400)
        

    user = User.objects.create_user(username=username, password=password)
    return Response({"message": "Registration successful!"})


@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    

    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({"message": "Login successful!", "username": user.username})
    else:
        return Response({"error": "Invalid username or password!"}, status=400)