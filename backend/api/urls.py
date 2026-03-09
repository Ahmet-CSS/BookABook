from django.urls import include, path
from . import views
from .views import register, user_login, create_borrow_request

urlpatterns = [
    path('books/', views.books_collection),
    path('login/', views.user_login),     
    path('register/', views.register),     
    path('borrow/', views.create_borrow_request, name='borrow'),     
    path('borrow-requests/', views.get_borrow_requests, name='borrow-requests'),
]
