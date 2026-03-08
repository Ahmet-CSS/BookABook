from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status

from .models import Book, BorrowRequest
from .serializers import BookSerializer, BorrowRequestSerializer

@api_view(['GET'])
def get_books(_request):
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
    


@api_view(['POST'])
def create_borrow_request(request):
    book_id = request.data.get('book_id')
    borrower = request.data.get('borrower')

    if not book_id or not borrower:
        return Response({"error": "Book ID and borrower cannot be empty!"}, status=400)
    
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found!"}, status=404)
    
    existing_request = BorrowRequest.objects.filter(book=book, borrower=borrower, status='pending').first()
    if existing_request:
        return Response({"error": "You already have a pending borrow request for this book!"}, status=400)
    
    borrow_request = BorrowRequest.objects.create(book=book, borrower=borrower, status='pending')
    serializer = BorrowRequestSerializer(borrow_request)
    return Response(serializer.data, status=201)
