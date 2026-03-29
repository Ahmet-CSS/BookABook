from rest_framework import serializers
from .models import Book, BorrowRequest, Reservation

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__' 

class BorrowRequestSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    class Meta:
        model = BorrowRequest
        fields = ['id', 'book', 'book_title', 'borrower', 'status']


class ReservationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'book', 'book_title', 'reserver', 'status']