import React, { useState, useEffect } from 'react';
import { styles } from './styles/styles';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import BrowsePage from './pages/BrowsePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [borrowedBooks] = useState([]);

  const [borrowRequests, setBorrowRequests] = useState([]);
  const [receivedBorrowRequests, setReceivedBorrowRequests] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [selectedExchangeBook, setSelectedExchangeBook] = useState('');

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

  const loadBooks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/books/');
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      // Keep the existing in-memory list if the backend is temporarily unavailable.
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMessage('empty input');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUsername(data.username || username);
        setErrorMessage('');
        await loadBooks();
      } else {
        setErrorMessage(data.error || 'Login failed, please check your credentials');
      }
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
      const response = await fetch('http://localhost:8000/api/register/', {
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
    localStorage.removeItem('token');
  };

  const handleAddBook = async () => {
    if (!newBookTitle.trim() || !newBookAuthor.trim() || !newBookGenre.trim() || !newBookIsbn.trim()) {
      setAddBookMessage('Please fill in title, author, genre, and ISBN.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/books/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBookTitle.trim(),
          author: newBookAuthor.trim(),
          genre: newBookGenre.trim(),
          isbn: newBookIsbn.trim(),
          owner: username || 'Unknown',
          rating: 5.0,
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
      const response = await fetch(`http://localhost:8000/api/books/${bookId}/`, {
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

  const handleBorrowRequest = async (book) => {
    const alreadyRequested = borrowRequests.some(
      (request) => request.book === book.id && request.borrower === username
    );

    if (alreadyRequested) {
      alert('You already requested this book.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/borrow/', {
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
    } catch (error) {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleUndoBorrowRequest = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/borrow-request/${requestId}/`, {
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
    } catch (error) {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };

  const handleExchangeRequest = async (book) => {
    const alreadyRequested = exchangeRequests.some(
      (request) => request.requestedBookTitle === book.title && request.owner === book.owner
    );

    if (alreadyRequested) {
      alert('You already requested this book for exchange.');
      return;
    }

    const myBooks = books.filter((b) => b.owner === username);
    if (myBooks.length === 0) {
      alert('You need to have at least one book listed to request an exchange.');
      return;
    }

    try {
      const newRequest = {
        id: Date.now(),
        requestedBookTitle: book.title,
        owner: book.owner,
        offeredBookTitle: myBooks[0].title,
        status: 'Pending',
      };

      setExchangeRequests((prev) => [...prev, newRequest]);
      alert('Exchange request sent successfully!');
    } catch (error) {
      alert('Failed to connect to Django. Is the server running & CORS configured?');
    }
  };


  useEffect(() => {
    const fetchMyBorrowRequests = async () => {
      if (!isLoggedIn || !username) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/borrow-requests/?borrower=${username}`);
        const data = await response.json();

        if (response.ok) {
          setBorrowRequests(data);
        }
      } catch (error) {
        console.error('Failed to fetch my borrow requests:', error);
      }
    };

    const fetchReceivedBorrowRequests = async () => {
      if (!isLoggedIn || !username) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/borrow-requests/?owner=${username}`);
        const data = await response.json();

        if (response.ok) {
          setReceivedBorrowRequests(data);
        }
      } catch (error) {
        console.error('Failed to fetch received borrow requests:', error);
      }
    };

    fetchMyBorrowRequests();
    fetchReceivedBorrowRequests();
  }, [isLoggedIn, username]);


    

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
      <Navbar view={view} setView={setView} search={search} setSearch={setSearch} onLogout={handleLogout} />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {view === 'browse' && <BrowsePage books={filteredBooks} onBorrowRequest={handleBorrowRequest} borrowRequests={borrowRequests}
           onExchangeRequest={handleExchangeRequest} username={username} exchangeRequests={exchangeRequests}
           myBooks={books.filter((b) => b.owner === username)}
           selectedExchangeBook={selectedExchangeBook}
           setSelectedExchangeBook={setSelectedExchangeBook}
            />}

        {view === 'dashboard' && (
          <DashboardPage
            borrowedBooks={borrowedBooks}
            borrowRequests={borrowRequests}
            receivedBorrowRequests={receivedBorrowRequests}
            exchangeRequests={exchangeRequests}
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
          />
        )}
      </div>
    </div>
  );
}
