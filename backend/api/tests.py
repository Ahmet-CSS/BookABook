from django.test import TestCase
from rest_framework.test import APIClient

from .models import Book


class BookApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.books_url = '/api/books/'

    def test_create_book_success(self):
        payload = {
            'title': 'Clean Code',
            'author': 'Robert C. Martin',
            'genre': 'Software',
            'isbn': '9780132350884',
            'owner': 'nithin',
            'rating': 4.7,
        }

        response = self.client.post(self.books_url, payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Book.objects.count(), 1)
        self.assertEqual(Book.objects.first().isbn, payload['isbn'])

    def test_create_book_missing_required_field(self):
        payload = {
            'title': 'Domain-Driven Design',
            'author': 'Eric Evans',
            'genre': 'Software',
            'owner': 'nithin',
        }

        response = self.client.post(self.books_url, payload, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data.get('error'), 'ISBN is required.')

    def test_list_books(self):
        Book.objects.create(
            title='Refactoring',
            author='Martin Fowler',
            genre='Software',
            isbn='9780201485677',
            owner='nithin',
            rating=4.5,
        )

        response = self.client.get(self.books_url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Refactoring')
