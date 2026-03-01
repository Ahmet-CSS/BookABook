from django.urls import path

from . import views


urlpatterns = [
    path("books/", views.books_collection, name="books_collection"),
    path("borrow-requests/", views.borrow_requests_collection, name="borrow_requests_collection"),
    path(
        "borrow-requests/<int:request_id>/decision/",
        views.decide_borrow_request,
        name="decide_borrow_request",
    ),
    path("exchange-requests/", views.create_exchange_request, name="create_exchange_request"),
    path(
        "exchange-requests/<int:request_id>/decision/",
        views.decide_exchange_request,
        name="decide_exchange_request",
    ),
]
