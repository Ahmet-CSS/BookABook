from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from .models import Book
from .serializers import BookSerializer

@api_view(['GET', 'POST'])
def books_collection(request):
    if request.method == 'GET':
        books = Book.objects.all().order_by('-id')
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    isbn = str(request.data.get('isbn', '')).strip()
    if not isbn:
        return Response({"error": "ISBN is required."}, status=400)

    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Username and password cannot be empty!"}, status=400)
        
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists, please choose another one!"}, status=400)
        

    User.objects.create_user(username=username, password=password)
    return Response({"message": "Registration successful!"})


@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    

    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({"message": "Login successful!", "username": user.get_username()})
    else:
        return Response({"error": "Invalid username or password!"}, status=400)
