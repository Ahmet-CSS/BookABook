from django.contrib import admin

from .models import Book, BookRating, BorrowRequest, ChatMessage, ExchangeRequest, Reservation

admin.site.register(Book)
admin.site.register(BorrowRequest)
admin.site.register(ExchangeRequest)
admin.site.register(BookRating)
admin.site.register(Reservation)
admin.site.register(ChatMessage)
