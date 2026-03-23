from django.urls import include, path
from . import views
from .views import register, user_login, create_borrow_request, create_exchange_request,  get_exchange_requests, accept_exchange_request, reject_exchange_request, delete_borrow_request

urlpatterns = [
    path('books/', views.books_collection),
    path('login/', views.user_login),     
    path('register/', views.register),     
    path('borrow/', views.create_borrow_request, name='borrow'),     
    path('borrow-requests/', views.get_borrow_requests, name='borrow-requests'),
    path('borrow-request/<int:request_id>/', delete_borrow_request, name='delete-borrow-request'),
    path('exchange-request/', create_exchange_request),
    path('exchange-requests/', get_exchange_requests),
    path('exchange-request/<int:request_id>/accept/', accept_exchange_request),
    path('exchange-request/<int:request_id>/reject/', reject_exchange_request),
]
