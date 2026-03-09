from django.urls import include, path
from . import views
from .views import  register, user_login, create_borrow_request

urlpatterns = [
    path('books/', views.books_collection),
    path('login/', views.user_login),     
    path('register/', views.register),     
    path('borrow/', views.create_borrow_request),     
    path('borrow-requests/', views.create_borrow_request, name='borrow-requests'),
]
