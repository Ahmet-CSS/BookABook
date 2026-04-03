import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import BrowsePage from './pages/BrowsePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import RankPage from './pages/RankPage';
import { styles } from './styles/styles';
import { theme } from './styles/theme';

const API_BASE = 'http://localhost:8000/api';

export default function App() {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [borrowedBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [receivedBorrowRequests, setReceivedBorrowRequests] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [chatUsers, setChatUsers] = useState([]);
  const [chatConversations, setChatConversations] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [seenNotificationKey, setSeenNotificationKey] = useState('');
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedBookForExchange, setSelectedBookForExchange] = useState(null);
  const [targetBook, setTargetBook] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookGenre, setNewBookGenre] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [addBookMessage, setAddBookMessage] = useState('');

  const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(search.toLowerCase()));
  const listedBooks = books.filter((book) => (book.owner || '').toLowerCase() === username.toLowerCase());
  const notificationItems = [...borrowRequests, ...receivedBorrowRequests];
  const notificationKey = JSON.stringify(
    notificationItems.map((item) => ({
      id: item.id,
      status: item.status,
      borrower: item.borrower,
      title: item.book_title,
    }))
  );
  const hasUnreadNotifications = notificationItems.length > 0 && notificationKey !== seenNotificationKey;
  const hasUnreadChat = chatConversations.some((conversation) => (conversation.unread_count || 0) > 0);

  const normalizeExchangeRequest = (request) => ({
    id: request.id,
    requestedBookTitle: request.requestedBookTitle || request.requested_book_title,
    owner: request.owner || request.requested_book_owner,
    offeredBookTitle: request.offeredBookTitle || request.offered_book_title,
    status: request.status,
  });

  const loadBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/books/`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      // Keep the current list if the backend is unavailable.
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('empty input');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Login failed, please check your credentials');
        return;
      }

      setIsLoggedIn(true);
      setUsername(data.username || username);
      setErrorMessage('');
      await loadBooks();
    } catch {
      setErrorMessage('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username and password cannot be empty!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setErrorMessage(data.message || 'Registration successful! Please log in.');
        setIsLoginMode(true);
        setPassword('');
      } else {
        setErrorMessage(data.error || 'Registration failed, username may already exist');
      }
    } catch {
      setErrorMessage('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setView('browse');
    setBorrowRequests([]);
    setReceivedBorrowRequests([]);
    setExchangeRequests([]);
    setReservations([]);
    setChatUsers([]);
    setChatConversations([]);
    setSelectedChatUser('');
    setChatMessages([]);
    setNewMessage('');
    setSeenNotificationKey('');
    setIsExchangeModalOpen(false);
    setSelectedBookForExchange(null);
    setTargetBook(null);
    localStorage.removeItem('token');
  };

  const handleAddBook = async () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim() || !newBookGenre.trim() || !newBookIsbn.trim()) {
      setAddBookMessage('Please fill in title, author, genre, and ISBN.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/books/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBookTitle.trim(),
          author: newBookAuthor.trim(),
          genre: newBookGenre.trim(),
          isbn: newBookIsbn.trim(),
          owner: username || 'Unknown',
          rating: 5.0,
          status: 'available',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAddBookMessage(data.error || 'Failed to add the book.');
        return;
      }

      setBooks((prev) => [data, ...prev]);
      setNewBookTitle('');
      setNewBookAuthor('');
      setNewBookGenre('');
      setNewBookIsbn('');
      setAddBookMessage('Book added successfully.');
    } catch {
      setAddBookMessage('Could not reach backend. Please ensure Django is running.');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await fetch(`${API_BASE}/books/${bookId}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete the book.');
        return;
      }

      setBooks((prev) => prev.filter((book) => book.id !== bookId));
      setAddBookMessage('Book deleted successfully.');
    } catch {
      alert('Could not reach backend. Please ensure Django is running.');
    }
  };

  const handleRateBook = async (bookId, bookTitle, userRating) => {
    try {
      const response = await fetch(`${API_BASE}/books/${bookId}/rate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: userRating, username }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Failed to rate the book.');
        return;
      }

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.id === bookId ? { ...book, rating: data.new_average_rating } : book
        )
      );
      alert(`Success! Rated "${bookTitle}" ${userRating} stars.`);
    } catch {
      alert('Failed to rate the book. Please try again.');
    }
  };

  const handleBorrowRequest = async (book) => {
    const alreadyRequested = borrowRequests.some(
      (request) => request.book === book.id && request.borrower === username
    );
    if (alreadyRequested) {
      alert('You already requested this book.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/borrow/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: book.id, borrower: username }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create borrow request.');
        return;
      }

      setBorrowRequests((prev) => [...prev, data]);
      alert('Borrow request sent successfully!');
    } catch {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleUndoBorrowRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_BASE}/borrow-request/${requestId}/`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to undo borrow request.');
        return;
      }

      setBorrowRequests((prev) => prev.filter((request) => request.id !== requestId));
      setReceivedBorrowRequests((prev) => prev.filter((request) => request.id !== requestId));
      alert('Borrow request removed.');
    } catch {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleExchangeRequest = (book) => {
    const alreadyRequested = exchangeRequests.some((request) => {
      const normalized = normalizeExchangeRequest(request);
      return normalized.requestedBookTitle === book.title && normalized.owner === book.owner;
    });
    if (alreadyRequested) {
      alert('You already requested this book for exchange.');
      return;
    }

    const myBooks = books.filter((candidate) => candidate.owner === username);
    if (myBooks.length === 0) {
      alert('You need to have at least one book listed to request an exchange.');
      return;
    }

    setTargetBook(book);
    setSelectedBookForExchange(null);
    setIsExchangeModalOpen(true);
  };

  const handleConfirmExchangeRequest = async () => {
    if (!targetBook || !selectedBookForExchange) {
      alert('Select a book first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/exchange-request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: targetBook.id,
          requester: username,
          offered_book_title: selectedBookForExchange.title,
          offered_book_author: selectedBookForExchange.author,
          offered_book_genre: selectedBookForExchange.genre,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create exchange request.');
        return;
      }

      const createdRequest = normalizeExchangeRequest({
        id: data.exchange_request_id,
        requestedBookTitle: targetBook.title,
        owner: targetBook.owner,
        offeredBookTitle: selectedBookForExchange.title,
        status: 'pending',
      });
      setExchangeRequests((prev) => [...prev, createdRequest]);
      setIsExchangeModalOpen(false);
      setSelectedBookForExchange(null);
      setTargetBook(null);
      alert('Exchange request sent successfully!');
    } catch {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleReserveRequest = async (book) => {
    try {
      const response = await fetch(`${API_BASE}/reserve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: book.id, reserver: username }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to reserve the book.');
        return;
      }

      setReservations((prev) => [...prev, data]);
      alert('Book reserved successfully!');
    } catch {
      alert('Failed to connect to backend.');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`${API_BASE}/reservation/${reservationId}/cancel/`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to cancel reservation.');
        return;
      }

      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
      alert('Reservation cancelled.');
    } catch {
      alert('Failed to connect to backend.');
    }
  };

  const loadChatUsers = async () => {
    if (!username) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/users/?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      if (response.ok) {
        setChatUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch chat users:', error);
    }
  };

  const loadChatConversations = async () => {
    if (!username) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/conversations/?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      if (response.ok) {
        setChatConversations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch chat conversations:', error);
    }
  };

  const loadChatMessages = async (otherUser) => {
    if (!username || !otherUser) {
      setChatMessages([]);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/chat/messages/?username=${encodeURIComponent(username)}&with_user=${encodeURIComponent(otherUser)}`
      );
      const data = await response.json();
      if (response.ok) {
        setChatMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!selectedChatUser || !newMessage.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/chat/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: username,
          recipient: selectedChatUser,
          content: newMessage.trim(),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to send message.');
        return;
      }

      setChatMessages((prev) => [...prev, data]);
      setNewMessage('');
      await loadChatConversations();
    } catch {
      alert('Failed to connect to backend.');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadBooks();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const fetchBorrowData = async () => {
      if (!isLoggedIn || !username) {
        return;
      }

      try {
        const [myResponse, receivedResponse] = await Promise.all([
          fetch(`${API_BASE}/borrow-requests/?borrower=${encodeURIComponent(username)}`),
          fetch(`${API_BASE}/borrow-requests/?owner=${encodeURIComponent(username)}`),
        ]);

        const [myData, receivedData] = await Promise.all([myResponse.json(), receivedResponse.json()]);

        if (myResponse.ok) {
          setBorrowRequests(Array.isArray(myData) ? myData : []);
        }
        if (receivedResponse.ok) {
          setReceivedBorrowRequests(Array.isArray(receivedData) ? receivedData : []);
        }
      } catch (error) {
        console.error('Failed to fetch borrow requests:', error);
      }
    };

    fetchBorrowData();
  }, [isLoggedIn, username]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!isLoggedIn || !username) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/reservations/?reserver=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (response.ok) {
          setReservations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      }
    };

    fetchReservations();
  }, [isLoggedIn, username]);

  useEffect(() => {
    const fetchExchangeRequests = async () => {
      if (!isLoggedIn || !username) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/exchange-requests/?requester=${encodeURIComponent(username)}`);
        const data = await response.json();
        if (response.ok) {
          setExchangeRequests(Array.isArray(data) ? data.map(normalizeExchangeRequest) : []);
        }
      } catch (error) {
        console.error('Failed to fetch exchange requests:', error);
      }
    };

    fetchExchangeRequests();
  }, [isLoggedIn, username]);

  useEffect(() => {
    if (!isLoggedIn || !username) {
      return;
    }

    loadChatUsers();
    loadChatConversations();
  }, [isLoggedIn, username]);

  useEffect(() => {
    if (!isLoggedIn || !username || view !== 'chat') {
      return;
    }

    loadChatConversations();
    const intervalId = window.setInterval(() => {
      loadChatConversations();
      if (selectedChatUser) {
        loadChatMessages(selectedChatUser);
      }
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, username, view, selectedChatUser]);

  useEffect(() => {
    if (view === 'chat' && selectedChatUser) {
      loadChatMessages(selectedChatUser);
    }
  }, [view, selectedChatUser]);

  useEffect(() => {
    if (view === 'notifications') {
      setSeenNotificationKey(notificationKey);
    }
  }, [view, notificationKey]);

  if (!isLoggedIn) {
    return (
      <LoginPage
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        errorMessage={errorMessage}
        isLoginMode={isLoginMode}
        setIsLoginMode={(value) => {
          setIsLoginMode(value);
          setErrorMessage('');
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div style={styles.container}>
      <Navbar
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
        onLogout={handleLogout}
        hasUnreadNotifications={hasUnreadNotifications}
        hasUnreadChat={hasUnreadChat}
      />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {view === 'browse' && (
          <BrowsePage
            books={filteredBooks}
            onBorrowRequest={handleBorrowRequest}
            borrowRequests={borrowRequests}
            onExchangeRequest={handleExchangeRequest}
            username={username}
            exchangeRequests={exchangeRequests}
            onReserveRequest={handleReserveRequest}
            onCancelReservation={handleCancelReservation}
            reservations={reservations}
          />
        )}

        {view === 'dashboard' && (
          <DashboardPage
            borrowedBooks={borrowedBooks}
            borrowRequests={borrowRequests}
            receivedBorrowRequests={receivedBorrowRequests}
            exchangeRequests={exchangeRequests}
            reservations={reservations}
            onUndoBorrowRequest={handleUndoBorrowRequest}
          />
        )}

        {view === 'notifications' && (
          <NotificationsPage
            borrowRequests={borrowRequests}
            receivedBorrowRequests={receivedBorrowRequests}
            onUndoBorrowRequest={handleUndoBorrowRequest}
          />
        )}

        {view === 'profile' && (
          <ProfilePage
            username={username}
            booksListed={listedBooks.length}
            booksBorrowed={borrowedBooks.length}
            listedBooks={listedBooks}
            borrowedBooks={borrowedBooks}
            newBookTitle={newBookTitle}
            setNewBookTitle={setNewBookTitle}
            newBookAuthor={newBookAuthor}
            setNewBookAuthor={setNewBookAuthor}
            newBookGenre={newBookGenre}
            setNewBookGenre={setNewBookGenre}
            newBookIsbn={newBookIsbn}
            setNewBookIsbn={setNewBookIsbn}
            addBookMessage={addBookMessage}
            onAddBook={handleAddBook}
            onDeleteBook={handleDeleteBook}
            onRateBook={handleRateBook}
          />
        )}

        {view === 'chat' && (
          <ChatPage
            username={username}
            users={chatUsers}
            conversations={chatConversations}
            selectedChatUser={selectedChatUser}
            setSelectedChatUser={setSelectedChatUser}
            messages={chatMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            onSendMessage={handleSendMessage}
          />
        )}

        {view === 'rank' && <RankPage books={books} />}
      </div>

      {isExchangeModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: theme.cardBg,
              padding: '30px',
              borderRadius: '24px',
              width: '420px',
              border: `1px solid ${theme.border}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                borderBottom: `1px solid ${theme.border}`,
                paddingBottom: '10px',
              }}
            >
              Select a book to exchange
            </h3>

            <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
              {books
                .filter((book) => book.owner === username)
                .map((book) => (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookForExchange(book)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      background: selectedBookForExchange?.id === book.id ? theme.primary : theme.bg,
                      color: selectedBookForExchange?.id === book.id ? 'white' : theme.text,
                      border: `1px solid ${theme.border}`,
                      transition: '0.2s',
                    }}
                  >
                    {book.title}
                  </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: theme.border,
                  color: theme.text,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setIsExchangeModalOpen(false);
                  setSelectedBookForExchange(null);
                  setTargetBook(null);
                }}
              >
                Cancel
              </button>

              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: theme.primary,
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
                onClick={handleConfirmExchangeRequest}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
