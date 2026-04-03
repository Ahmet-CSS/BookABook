from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    genre = models.CharField(max_length=50)
    isbn = models.CharField(max_length=20, default='')
    owner = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, default='available')  # available, borrowed, exchanged

    def __str__(self):
        return self.title

class BorrowRequest(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrower = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default='pending')  # pending, accepted, rejected

    def __str__(self):
        return f"{self.borrower} wants to borrow {self.book.title}"
    
class ExchangeRequest(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    requester = models.CharField(max_length=100)
    offered_book_title = models.CharField(max_length=200)
    offered_book_author = models.CharField(max_length=100)
    offered_book_genre = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default='pending')  # pending, accepted, rejected

    def __str__(self):
        return f"{self.requester} wants to exchange {self.book.title} for {self.offered_book_title}"


class BookRating(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='ratings')
    username = models.CharField(max_length=100)
    score = models.IntegerField()

    class Meta:
        unique_together = ('book', 'username')

    def __str__(self):
        return f"{self.username} rated {self.book.title} - {self.score} stars"


class Reservation(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    reserver = models.CharField(max_length=100)
    status = models.CharField(max_length=30, default='pending')  # active, completed, cancelled

    def __str__(self):
        return f"{self.reserver} reserved {self.book.title}"


class ChatMessage(models.Model):
    sender = models.CharField(max_length=100)
    recipient = models.CharField(max_length=100)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender} -> {self.recipient}"
