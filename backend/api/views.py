import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status

from .models import Book, BorrowRequest, Reservation
from .serializers import BookSerializer, BorrowRequestSerializer, ReservationSerializer

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Book, ExchangeRequest

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

@api_view(['GET'])
def get_borrow_requests(request):
    borrower = request.GET.get('borrower')
    if not borrower:
        return Response({"error": "Borrower is required!"}, status=400)
    
    requests = BorrowRequest.objects.filter(borrower=borrower)
    serializer = BorrowRequestSerializer(requests, many=True)
    return Response(serializer.data, status=200)

# views for reservation and exchange requests
@api_view(['POST'])
def create_reservation(request):
    book_id = request.data.get('book_id')
    reserver = request.data.get('reserver')

    if not book_id or not reserver:
        return Response(
            {'error': 'book_id and reserver are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response(
            {'error': 'Book not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    if book.status != 'unavailable':
        return Response(
            {'error': 'Only unavailable books can be reserved'},
            status=status.HTTP_400_BAD_REQUEST
        )

    existing_reservation = Reservation.objects.filter(book=book, reserver=reserver).first()
    if existing_reservation:
        return Response(
            {'error': 'You already reserved this book'},
            status=status.HTTP_400_BAD_REQUEST
        )

    reservation = Reservation.objects.create(
        book=book,
        reserver=reserver,
        status='pending'
    )

    serializer = ReservationSerializer(reservation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# view to get reservations for a user
@api_view(['GET'])
def get_reservations(request):
    reserver = request.GET.get('reserver')
    if not reserver:
        return Response(
            {'error': 'reserver is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    reservations = Reservation.objects.filter(reserver=reserver)
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

    
@csrf_exempt
def create_exchange_request(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    try:
        data = json.loads(request.body)

        book_id = data.get('book_id')
        requester = data.get('requester')
        offered_book_title = data.get('offered_book_title')
        offered_book_author = data.get('offered_book_author')
        offered_book_genre = data.get('offered_book_genre')

        if not book_id or not requester or not offered_book_title or not offered_book_author or not offered_book_genre:
            return JsonResponse({'error': 'All fields are required'}, status=400)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return JsonResponse({'error': 'Requested book not found'}, status=404)

        if book.owner == requester:
            return JsonResponse({'error': 'You cannot exchange your own book'}, status=400)

        existing_request = ExchangeRequest.objects.filter(
            book=book,
            requester=requester,
            offered_book_title=offered_book_title,
            status='pending'
        ).first()

        if existing_request:
            return JsonResponse({'error': 'You already have a pending exchange request for this book'}, status=400)

        exchange_request = ExchangeRequest.objects.create(
            book=book,
            requester=requester,
            offered_book_title=offered_book_title,
            offered_book_author=offered_book_author,
            offered_book_genre=offered_book_genre,
            status='pending'
        )

        return JsonResponse({
            'message': 'Exchange request created successfully',
            'exchange_request_id': exchange_request.id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def get_exchange_requests(request):
    if request.method != 'GET':
        return JsonResponse({'error': 'Only GET method allowed'}, status=405)

    requester = request.GET.get('requester')
    if not requester:
        return JsonResponse({'error': 'Requester is required'}, status=400)

    exchange_requests = ExchangeRequest.objects.filter(requester=requester)

    data = []
    for exchange in exchange_requests:
        data.append({
            'id': exchange.id,
            'book_id': exchange.book.id,
            'requested_book_title': exchange.book.title,
            'requested_book_author': exchange.book.author,
            'requested_book_genre': exchange.book.genre,
            'requested_book_owner': exchange.book.owner,
            'requester': exchange.requester,
            'offered_book_title': exchange.offered_book_title,
            'offered_book_author': exchange.offered_book_author,
            'offered_book_genre': exchange.offered_book_genre,
            'status': exchange.status,
        })

    return JsonResponse(data, safe=False)


@csrf_exempt
def accept_exchange_request(request, request_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    try:
        exchange_request = ExchangeRequest.objects.get(id=request_id)
        exchange_request.status = 'accepted'
        exchange_request.save()

        return JsonResponse({'message': 'Exchange request accepted'})
    except ExchangeRequest.DoesNotExist:
        return JsonResponse({'error': 'Exchange request not found'}, status=404)
    

@csrf_exempt
def reject_exchange_request(request, request_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)

    try:
        exchange_request = ExchangeRequest.objects.get(id=request_id)
        exchange_request.status = 'rejected'
        exchange_request.save()

        return JsonResponse({'message': 'Exchange request rejected'})
    except ExchangeRequest.DoesNotExist:
        return JsonResponse({'error': 'Exchange request not found'}, status=404)