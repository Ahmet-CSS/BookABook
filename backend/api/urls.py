from django.urls import path

from . import views


urlpatterns = [
    path("books/", views.books_collection, name="books"),
    path("books/<int:book_id>/", views.book_detail, name="book-detail"),
    path("books/<int:book_id>/rate/", views.rate_book, name="rate-book"),
    path("books/<int:book_id>/status/", views.update_book_status, name="update-book-status"),
    path("login/", views.user_login, name="login"),
    path("register/", views.register, name="register"),
    path("borrow/", views.create_borrow_request, name="borrow"),
    path("borrow-requests/", views.get_borrow_requests, name="borrow-requests"),
    path("borrow-request/<int:request_id>/", views.delete_borrow_request, name="delete-borrow-request"),
    path("borrow-request/<int:request_id>/accept/", views.accept_borrow_request, name="accept-borrow-request"),
    path("borrow-request/<int:request_id>/reject/", views.reject_borrow_request, name="reject-borrow-request"),

    path("exchange-request/", views.create_exchange_request, name="exchange-request"),
    path("exchange-requests/", views.get_exchange_requests, name="exchange-requests"),
    path("exchange-request/<int:request_id>/accept/", views.accept_exchange_request, name="accept-exchange-request"),
    path("exchange-request/<int:request_id>/reject/", views.reject_exchange_request, name="reject-exchange-request"),
    path("reserve/", views.create_reservation, name="reserve"),
    path("reservations/", views.get_reservations, name="reservations"),
    path("reservation/<int:reservation_id>/cancel/", views.cancel_reservation, name="cancel-reservation"),
    path("chat/users/", views.chat_users, name="chat-users"),
    path("chat/conversations/", views.chat_conversations, name="chat-conversations"),
    path("chat/messages/", views.chat_messages, name="chat-messages"),
]
