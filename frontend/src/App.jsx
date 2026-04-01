import React, { useState, useEffect } from 'react';
import { styles } from './styles/styles';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import BrowsePage from './pages/BrowsePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import RankPage from './pages/RankPage';
import { theme } from './styles/theme';

export default function App() {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');
  const [ratedBooks, setRatedBooks] = useState({});
  const [books, setBooks] = useState([]);
  const [borrowedBooks] = useState([]);

  const [borrowRequests, setBorrowRequests] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [selectedExchangeBook, setSelectedExchangeBook] = useState('');

  const [reservations, setReservations] = useState([]);

  //state for popup
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [selectedBookForExchange, setSelectedBookForExchange] = useState(null);
  const [targetBook, setTargetBook] = useState(null); // the book user wants

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

const handleRateBook = async (bookId, bookTitle, userRating) => {
  try {
    const response = await fetch(`http://localhost:8000/api/books/${bookId}/rate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: userRating,
        username: username 
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const newAverageRating = data.new_average_rating;


    setBooks(prevBooks => prevBooks.map(book => {
      if (book.id === bookId) {
        return { ...book, rating: newAverageRating };
      }
      return book;
    }));

    setRatedBooks(prev => ({ ...prev, [bookTitle]: userRating }));
    alert(`Success! Rated ${userRating} stars. New average is ${newAverageRating}`);

  } catch (error) {
    console.error("Error rating book:", error);
    alert("Failed to rate the book. Please try again.");
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

  try {    const response = await fetch('http://localhost:8000/api/borrow/', {
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

const handleExchangeRequest = (book) => {
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

    
    setTargetBook(book);
    setIsExchangeModalOpen(true);
  };


  useEffect(() => {
  const fetchBorrowRequests = async () => {
    if (!isLoggedIn || !username) return;

    try {
      const response = await fetch(`http://localhost:8000/api/borrow-requests/?borrower=${username}`);
      const data = await response.json();

      if (response.ok) {
        setBorrowRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch borrow requests:', error);
    }
  };

  fetchBorrowRequests();
}, [isLoggedIn, username]);



useEffect(() => {
  const fetchReservations = async () => {
    if (!isLoggedIn || !username) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/reservations/?reserver=${username}`
      );
      const data = await response.json();

      if (response.ok) {
        setReservations(data);
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  fetchReservations();


}, [isLoggedIn, username]);


const handleReserveRequest = async (book) => {
  try {
    const response = await fetch('http://localhost:8000/api/reserve/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book_id: book.id,
        reserver: username,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Failed to reserve the book.');
      return;
    }

    setReservations((prev) => [...prev, data]);
    alert('Book reserved successfully!');
  } catch (error) {
    alert('Failed to connect to backend.');
  }
};



const handleCancelReservation = async (reservationId) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/reservation/${reservationId}/cancel/`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Failed to cancel reservation.');
      return;
    }

    setReservations((prev) =>
      prev.filter((reservation) => reservation.id !== reservationId)
    );
    alert('Reservation cancelled.');
  } catch (error) {
    alert('Failed to connect to backend.');
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
        {view === 'browse' && <BrowsePage books={filteredBooks} onBorrowRequest={handleBorrowRequest} borrowRequests={borrowRequests}
           onExchangeRequest={handleExchangeRequest} username={username} exchangeRequests={exchangeRequests}
           myBooks={books.filter((b) => b.owner === username)}
           selectedExchangeBook={selectedExchangeBook}
           setSelectedExchangeBook={setSelectedExchangeBook}
            onReserveRequest={handleReserveRequest}
            onCancelReservation={handleCancelReservation}
            reservations={reservations}

            />}

        {view === 'dashboard' && <DashboardPage borrowedBooks={borrowedBooks} borrowRequests={borrowRequests} exchangeRequests={exchangeRequests}
         reservations={reservations} />}

        {view === 'profile' && (
          <ProfilePage
            username={username}
            booksListed={listedBooks.length}
            booksBorrowed={borrowedBooks.length}
            listedBooks={listedBooks}
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
            borrowedBooks={borrowedBooks} 
            onRateBook={handleRateBook}
          />
        )}

        {view === 'rank' && <RankPage books={books} />}
        
{/* popup for exchange request*/}
      </div>
      {isExchangeModalOpen && (
      <div style={{
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
      }}>
         <div style={{
      background: theme.cardBg,
      padding: '30px',
      borderRadius: '24px',
      width: '420px',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      animation: 'fadeIn 0.2s ease'
    }}>
      
        <h3 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '20px',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '10px'
        }}>
           Select a book to Exchange 
           </h3>


          {/* BOOK LIST */}
      <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
        {books
          .filter((b) => b.owner === username)
          .map((b) => (
            <div
              key={b.id}
              onClick={() => setSelectedBookForExchange(b)}
              style={{
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '10px',
                cursor: 'pointer',
                background:
                  selectedBookForExchange?.id === b.id
                    ? theme.primary
                    : theme.bg,
                color:
                  selectedBookForExchange?.id === b.id
                    ? 'white'
                    : theme.text,
                border: `1px solid ${theme.border}`,
                transition: '0.2s'
              }}
            >
              {b.title}
            </div>
          ))}
      </div>

      {/* ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        
        <button
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            border: 'none',
            background: theme.border,
            color: theme.text,
            cursor: 'pointer'
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
            cursor: 'pointer'
          }}
          onClick={() => {
            if (!selectedBookForExchange) {
              alert('Select a book first');
              return;
            }

            const newRequest = {
              id: Date.now(),
              requestedBookTitle: targetBook.title,
              owner: targetBook.owner,
              offeredBookTitle: selectedBookForExchange.title,
              status: 'Pending',
            };

            setExchangeRequests((prev) => [...prev, newRequest]);

            setIsExchangeModalOpen(false);
            setSelectedBookForExchange(null);
            setTargetBook(null);
          }}
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
