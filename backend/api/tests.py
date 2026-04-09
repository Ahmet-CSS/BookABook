from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User

from .models import Book, BorrowRequest, ChatMessage, Reservation


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
            'listing_type': 'donation',
        }

        response = self.client.post(self.books_url, payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Book.objects.count(), 1)
        self.assertEqual(Book.objects.first().isbn, payload['isbn'])
        self.assertEqual(Book.objects.first().listing_type, payload['listing_type'])

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

    def test_create_book_defaults_listing_type_to_standard(self):
        payload = {
            'title': 'Patterns of Enterprise Application Architecture',
            'author': 'Martin Fowler',
            'genre': 'Software',
            'isbn': '9780321127426',
            'owner': 'nithin',
            'rating': 4.3,
        }

        response = self.client.post(self.books_url, payload, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['listing_type'], 'standard')


class ChatApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(username='alice', password='pw')
        User.objects.create_user(username='bob', password='pw')
        User.objects.create_user(username='carol', password='pw')
        self.book = Book.objects.create(
            title='The Pragmatic Programmer',
            author='Andrew Hunt',
            genre='Software',
            isbn='9780201616224',
            owner='bob',
            rating=4.8,
        )
        BorrowRequest.objects.create(book=self.book, borrower='alice', status='pending')

    def test_list_chat_users_excludes_current_user(self):
        response = self.client.get('/api/chat/users/?username=alice')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), ['bob'])

    def test_send_and_fetch_messages(self):
        post_response = self.client.post(
            '/api/chat/messages/',
            {'sender': 'alice', 'recipient': 'bob', 'content': 'Hello Bob'},
            format='json',
        )

        self.assertEqual(post_response.status_code, 201)
        self.assertEqual(ChatMessage.objects.count(), 1)

        get_response = self.client.get('/api/chat/messages/?username=bob&with_user=alice')

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(len(get_response.json()), 1)
        self.assertEqual(get_response.json()[0]['content'], 'Hello Bob')
        self.assertTrue(ChatMessage.objects.get().is_read)

    def test_chat_users_include_reservation_contact(self):
        Reservation.objects.create(book=self.book, reserver='carol', status='pending')

        response = self.client.get('/api/chat/users/?username=carol')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), ['bob'])

    def test_send_message_to_unrelated_user_is_rejected(self):
        response = self.client.post(
            '/api/chat/messages/',
            {'sender': 'alice', 'recipient': 'carol', 'content': 'Hello Carol'},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(ChatMessage.objects.count(), 0)


class BorrowRequestUpdateApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.book = Book.objects.create(
            title='Algorithms',
            author='CLRS',
            genre='Education',
            isbn='9780262033848',
            owner='nani22',
            rating=4.6,
        )
        self.borrow_request = BorrowRequest.objects.create(
            book=self.book,
            borrower='omen',
            status='accepted',
            due_date='2026-04-20',
        )

    def test_update_borrow_request_due_date(self):
        response = self.client.patch(
            f'/api/borrow-request/{self.borrow_request.id}/update/',
            {'due_date': '2026-04-30'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.borrow_request.refresh_from_db()
        self.assertEqual(str(self.borrow_request.due_date), '2026-04-30')

    def test_update_borrow_request_rejects_invalid_format(self):
        response = self.client.patch(
            f'/api/borrow-request/{self.borrow_request.id}/update/',
            {'due_date': '04-30-2026'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['error'], 'Invalid date format. Use YYYY-MM-DD.')
