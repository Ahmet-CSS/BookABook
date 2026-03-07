from django.urls import path
from . import views

urlpatterns = [
    path('books/', views.get_books), 
    path('login/', views.user_login),     
    path('register/', views.register),     
]