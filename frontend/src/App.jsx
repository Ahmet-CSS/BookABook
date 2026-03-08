import React, { useState } from 'react';
import { styles } from './styles/styles';
import { MOCK_BOOKS, MOCK_BORROWED } from './data/mock';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import BrowsePage from './pages/BrowsePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState(MOCK_BOOKS);
  const [borrowedBooks] = useState(MOCK_BORROWED);

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
        {view === 'browse' && <BrowsePage books={filteredBooks} />}
        {view === 'dashboard' && <DashboardPage borrowedBooks={borrowedBooks} />}
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
          />
        )}
      </div>
    </div>
  );
}
