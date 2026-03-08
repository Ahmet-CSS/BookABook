from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.books_collection),
    path('login/', views.user_login),     
    path('register/', views.register),     
]
