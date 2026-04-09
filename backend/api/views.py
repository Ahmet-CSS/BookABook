import json
from datetime import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Avg, Case, CharField, Count, F, Max, Q, When
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Book, BookRating, BorrowRequest, ChatMessage, ExchangeRequest, Reservation
from .serializers import BookSerializer, BorrowRequestSerializer, ChatMessageSerializer, ReservationSerializer
from django.utils import timezone 
from datetime import timedelta


def get_chat_contacts(username):
    contacts = set()

    contacts.update(
        BorrowRequest.objects.filter(borrower=username).values_list("book__owner", flat=True)
    )
    contacts.update(
        BorrowRequest.objects.filter(book__owner=username).values_list("borrower", flat=True)
    )
    contacts.update(
        Reservation.objects.filter(reserver=username).values_list("book__owner", flat=True)
    )
    contacts.update(
        Reservation.objects.filter(book__owner=username).values_list("reserver", flat=True)
    )
    contacts.update(
        ExchangeRequest.objects.filter(requester=username).values_list("book__owner", flat=True)
    )
    contacts.update(
        ExchangeRequest.objects.filter(book__owner=username).values_list("requester", flat=True)
    )

    contacts.discard("")
    contacts.discard(username)
    return sorted(contacts)


@api_view(["GET", "POST"])
def books_collection(request):
    if request.method == "GET":
        books = Book.objects.all().order_by("-id")
        serializer = BookSerializer(books, many=True)
        return Response(serializer.data)

    isbn = str(request.data.get("isbn", "")).strip()
    if not isbn:
        return Response({"error": "ISBN is required."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = BookSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def book_detail(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND)

    username = request.data.get("username")
    if username and book.owner != username:
        return Response({"error": "Only the owner can delete this book."}, status=status.HTTP_403_FORBIDDEN)

    book.delete()
    return Response({"message": "Book deleted successfully."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def register(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "Username and password cannot be empty!"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists, please choose another one!"}, status=status.HTTP_400_BAD_REQUEST)

    User.objects.create_user(username=username, password=password)
    return Response({"message": "Registration successful!"})


@api_view(["POST"])
def user_login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is not None:
        return Response({"message": "Login successful!", "username": user.get_username()})
    return Response({"error": "Invalid username or password!"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def create_borrow_request(request):
    book_id = request.data.get("book_id")
    borrower = request.data.get("borrower")

    if not book_id or not borrower:
        return Response({"error": "Book ID and borrower cannot be empty!"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found!"}, status=status.HTTP_404_NOT_FOUND)

    existing_request = BorrowRequest.objects.filter(book=book, borrower=borrower, status="pending").first()
    if existing_request:
        return Response({"error": "You already have a pending borrow request for this book!"}, status=status.HTTP_400_BAD_REQUEST)

    borrow_request = BorrowRequest.objects.create(book=book, borrower=borrower, status="pending")
    serializer = BorrowRequestSerializer(borrow_request)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_borrow_requests(request):
    borrower = request.GET.get("borrower")
    owner = request.GET.get("owner")

    if borrower:
        requests = BorrowRequest.objects.filter(borrower=borrower)
    elif owner:
        requests = BorrowRequest.objects.filter(book__owner=owner)
    else:
        return Response({"error": "Borrower or owner is required!"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = BorrowRequestSerializer(requests, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def delete_borrow_request(request, request_id):
    try:
        borrow_request = BorrowRequest.objects.get(id=request_id)
    except BorrowRequest.DoesNotExist:
        return Response({"error": "Borrow request not found!"}, status=status.HTTP_404_NOT_FOUND)

    borrow_request.delete()
    return Response({"message": "Borrow request removed."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def create_reservation(request):
    book_id = request.data.get("book_id")
    reserver = request.data.get("reserver")

    if not book_id or not reserver:
        return Response({"error": "book_id and reserver are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    if book.status != "unavailable":
        return Response({"error": "Only unavailable books can be reserved"}, status=status.HTTP_400_BAD_REQUEST)

    existing_reservation = Reservation.objects.filter(book=book, reserver=reserver).first()
    if existing_reservation:
        return Response({"error": "You already reserved this book"}, status=status.HTTP_400_BAD_REQUEST)

    reservation = Reservation.objects.create(book=book, reserver=reserver, status="pending")
    serializer = ReservationSerializer(reservation)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def get_reservations(request):
    reserver = request.GET.get("reserver")
    if not reserver:
        return Response({"error": "reserver is required"}, status=status.HTTP_400_BAD_REQUEST)

    reservations = Reservation.objects.filter(reserver=reserver)
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["DELETE"])
def cancel_reservation(request, reservation_id):
    try:
        reservation = Reservation.objects.get(id=reservation_id)
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)

    if reservation.status != "pending":
        return Response({"error": "Only pending reservations can be canceled"}, status=status.HTTP_400_BAD_REQUEST)

    reservation.delete()
    return Response({"message": "Reservation canceled successfully"}, status=status.HTTP_200_OK)

# Borrow request approval/rejection endpoints for book owners
@api_view(["POST"])
def accept_borrow_request(request, request_id):
    try:
        borrow_request = BorrowRequest.objects.get(id=request_id)
    except BorrowRequest.DoesNotExist:
        return Response({"error": "Borrow request not found!"}, status=status.HTTP_404_NOT_FOUND)

    borrow_request.status = "accepted"
    borrow_request.due_date = timezone.now().date() + timedelta(days=14)
    borrow_request.save()

    borrow_request.book.status = "unavailable"
    borrow_request.book.save()

    serializer = BorrowRequestSerializer(borrow_request)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Update due date on borrow request
@api_view(["PATCH"])
def update_borrow_request(request, request_id):
    try:
        borrow_request = BorrowRequest.objects.get(id=request_id)
    except BorrowRequest.DoesNotExist:
        return Response({"error": "Borrow request not found!"}, status=status.HTTP_404_NOT_FOUND)

    if borrow_request.status != "accepted":
        return Response({"error": "Only accepted borrow requests can have their due date updated."}, status=status.HTTP_400_BAD_REQUEST)

    due_date_str = str(request.data.get("due_date", "")).strip()
    if not due_date_str:
        return Response({"error": "due_date is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        new_due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

    if new_due_date < timezone.now().date():
        return Response({"error": "Due date cannot be in the past."}, status=status.HTTP_400_BAD_REQUEST)

    borrow_request.due_date = new_due_date
    borrow_request.save()

    serializer = BorrowRequestSerializer(borrow_request)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["POST"])
def reject_borrow_request(request, request_id):
    try:
        borrow_request = BorrowRequest.objects.get(id=request_id)
    except BorrowRequest.DoesNotExist:
        return Response({"error": "Borrow request not found!"}, status=status.HTTP_404_NOT_FOUND)

    borrow_request.status = "rejected"
    borrow_request.save()

    serializer = BorrowRequestSerializer(borrow_request)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["PATCH"])
def update_book_status(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if not new_status:
        return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

    book.status = new_status
    book.save()

    if book.status == "available":
        Reservation.objects.filter(book=book, status="pending").update(status="ready")

    return Response({"message": "Book status updated successfully", "book_status": book.status}, status=status.HTTP_200_OK)




@csrf_exempt
def create_exchange_request(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    try:
        data = json.loads(request.body)

        book_id = data.get("book_id")
        requester = data.get("requester")
        offered_book_title = data.get("offered_book_title")
        offered_book_author = data.get("offered_book_author")
        offered_book_genre = data.get("offered_book_genre")

        if not book_id or not requester or not offered_book_title or not offered_book_author or not offered_book_genre:
            return JsonResponse({"error": "All fields are required"}, status=400)

        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return JsonResponse({"error": "Requested book not found"}, status=404)

        if book.owner == requester:
            return JsonResponse({"error": "You cannot exchange your own book"}, status=400)

        existing_request = ExchangeRequest.objects.filter(
            book=book,
            requester=requester,
            offered_book_title=offered_book_title,
            status="pending",
        ).first()
        if existing_request:
            return JsonResponse({"error": "You already have a pending exchange request for this book"}, status=400)

        exchange_request = ExchangeRequest.objects.create(
            book=book,
            requester=requester,
            offered_book_title=offered_book_title,
            offered_book_author=offered_book_author,
            offered_book_genre=offered_book_genre,
            status="pending",
        )

        return JsonResponse({"message": "Exchange request created successfully", "exchange_request_id": exchange_request.id}, status=201)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)


def get_exchange_requests(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET method allowed"}, status=405)

    requester = request.GET.get("requester")
    owner = request.GET.get("owner")
    if requester:
        exchange_requests = ExchangeRequest.objects.filter(requester=requester)
    elif owner:
        exchange_requests = ExchangeRequest.objects.filter(book__owner=owner)
    else:
        return JsonResponse({"error": "requester or owner is required"}, status=400)
    
    data = [
        {
            "id": exchange.id,
            "book_id": exchange.book.id,
            "requested_book_title": exchange.book.title,
            "requested_book_author": exchange.book.author,
            "requested_book_genre": exchange.book.genre,
            "requested_book_owner": exchange.book.owner,
            "requester": exchange.requester,
            "offered_book_title": exchange.offered_book_title,
            "offered_book_author": exchange.offered_book_author,
            "offered_book_genre": exchange.offered_book_genre,
            "status": exchange.status,
        }
        for exchange in exchange_requests
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def accept_exchange_request(request, request_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    try:
        exchange_request = ExchangeRequest.objects.get(id=request_id)
    except ExchangeRequest.DoesNotExist:
        return JsonResponse({"error": "Exchange request not found"}, status=404)

    exchange_request.status = "accepted"
    exchange_request.save()
    return JsonResponse({"message": "Exchange request accepted"})


@csrf_exempt
def reject_exchange_request(request, request_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

    try:
        exchange_request = ExchangeRequest.objects.get(id=request_id)
    except ExchangeRequest.DoesNotExist:
        return JsonResponse({"error": "Exchange request not found"}, status=404)

    exchange_request.status = "rejected"
    exchange_request.save()
    return JsonResponse({"message": "Exchange request rejected"})


@api_view(["POST"])
def rate_book(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    username = request.data.get("username")
    score = request.data.get("rating")
    if not username or score is None:
        return Response({"error": "Username and rating are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        score = int(score)
    except (TypeError, ValueError):
        return Response({"error": "Rating must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

    if score < 1 or score > 5:
        return Response({"error": "Rating must be between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)

    BookRating.objects.update_or_create(book=book, username=username, defaults={"score": score})

    new_avg = book.ratings.aggregate(Avg("score"))["score__avg"]
    book.rating = round(new_avg, 1) if new_avg is not None else 0.0
    book.save()

    return Response({"new_average_rating": book.rating}, status=status.HTTP_200_OK)


@api_view(["GET"])
def chat_users(request):
    username = request.GET.get("username", "").strip()
    if not username:
        return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(get_chat_contacts(username), status=status.HTTP_200_OK)


@api_view(["GET"])
def chat_conversations(request):
    username = request.GET.get("username", "").strip()
    if not username:
        return Response({"error": "username is required"}, status=status.HTTP_400_BAD_REQUEST)

    allowed_contacts = set(get_chat_contacts(username))
    conversations = (
        ChatMessage.objects.filter(Q(sender=username) | Q(recipient=username))
        .annotate(
            other_user=Case(
                When(sender=username, then=F("recipient")),
                default=F("sender"),
                output_field=CharField(),
            )
        )
        .values("other_user")
        .annotate(last_message_at=Max("created_at"))
        .order_by("-last_message_at")
    )

    unread_counts = {
        row["sender"]: row["count"]
        for row in (
            ChatMessage.objects.filter(recipient=username, is_read=False)
            .values("sender")
            .annotate(count=Count("id"))
        )
    }

    data = [
        {
            "username": item["other_user"],
            "last_message_at": item["last_message_at"],
            "unread_count": unread_counts.get(item["other_user"], 0),
        }
        for item in conversations
        if item["other_user"] in allowed_contacts
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def chat_messages(request):
    if request.method == "GET":
        username = request.GET.get("username", "").strip()
        other_user = request.GET.get("with_user", "").strip()
        if not username or not other_user:
            return Response({"error": "username and with_user are required"}, status=status.HTTP_400_BAD_REQUEST)
        if other_user not in get_chat_contacts(username):
            return Response({"error": "Chat is only available for related users"}, status=status.HTTP_403_FORBIDDEN)

        messages = ChatMessage.objects.filter(
            (Q(sender=username) & Q(recipient=other_user))
            | (Q(sender=other_user) & Q(recipient=username))
        )
        ChatMessage.objects.filter(sender=other_user, recipient=username, is_read=False).update(is_read=True)
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    sender = str(request.data.get("sender", "")).strip()
    recipient = str(request.data.get("recipient", "")).strip()
    content = str(request.data.get("content", "")).strip()
    if not sender or not recipient or not content:
        return Response({"error": "sender, recipient, and content are required"}, status=status.HTTP_400_BAD_REQUEST)

    if sender == recipient:
        return Response({"error": "Cannot send a message to yourself"}, status=status.HTTP_400_BAD_REQUEST)

    if not User.objects.filter(username=recipient).exists():
        return Response({"error": "Recipient not found"}, status=status.HTTP_404_NOT_FOUND)
    if recipient not in get_chat_contacts(sender):
        return Response({"error": "Chat is only available for related users"}, status=status.HTTP_403_FORBIDDEN)

    message = ChatMessage.objects.create(sender=sender, recipient=recipient, content=content)
    serializer = ChatMessageSerializer(message)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
