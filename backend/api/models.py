from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    genre = models.CharField(max_length=50)
    owner = models.CharField(max_length=100)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.title
