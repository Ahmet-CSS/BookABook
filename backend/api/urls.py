from django.urls import include, path
from . import views
from .views import register, user_login, create_borrow_request, create_exchange_request,  get_exchange_requests, accept_exchange_request, reject_exchange_request, rate_book

urlpatterns = [
    path('books/', views.books_collection),
    path('books/<int:book_id>/rate/', rate_book, name='rate_book'),
    path('login/', views.user_login),     
    path('register/', views.register),     
    path('borrow/', views.create_borrow_request, name='borrow'),     
    path('borrow-requests/', views.get_borrow_requests, name='borrow-requests'),
    path('exchange-request/', create_exchange_request),
    path('exchange-requests/', get_exchange_requests),
    path('exchange-request/<int:request_id>/accept/', accept_exchange_request),
    path('exchange-request/<int:request_id>/reject/', reject_exchange_request),
    path('reserve/', views.create_reservation, name='reserve'),
    path('reservations/', views.get_reservations, name='reservations'),
    path('reservation/<int:reservation_id>/cancel/', views.cancel_reservation, name='cancel-reservation'),
    path('books/<int:book_id>/status/', views.update_book_status, name='update-book-status'),
    path('borrow-request/<int:request_id>/accept/', views.accept_borrow_request, name='accept-borrow-request'),
    path('borrow-request/<int:request_id>/reject/', views.reject_borrow_request, name='reject-borrow-request'),
]
