import React, { useState } from 'react';
import { Star, User, X } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function ProfilePage({
  username,
  booksListed,
  booksBorrowed,
  listedBooks,
  borrowedBooks,
  newBookTitle,
  setNewBookTitle,
  newBookAuthor,
  setNewBookAuthor,
  newBookGenre,
  setNewBookGenre,
  newBookIsbn,
  setNewBookIsbn,
  addBookMessage,
  onAddBook,
  onDeleteBook,
  onRateBook,
}) {
  const [ratedBooks, setRatedBooks] = useState({});

  const handleStarClick = (bookId, title, score) => {
    if (ratedBooks[title]) {
      return;
    }
    if (typeof onRateBook === 'function') {
      onRateBook(bookId, title, score);
      setRatedBooks((prev) => ({ ...prev, [title]: score }));
    }
  };

  return (
    <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.4fr)', gap: '16px' }}>
        <div style={{ background: theme.innerBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '18px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={22} /> Profile
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Username</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{username || 'Guest'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Books Listed</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{booksListed}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Books Borrowed</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{booksBorrowed}</div>
            </div>
          </div>
        </div>

        <div style={{ background: theme.innerBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '18px' }}>
          <h4 style={{ margin: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 'bold' }}>Listed Books</h4>
          {listedBooks.length === 0 ? (
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>No books listed yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {listedBooks.map((book) => (
                <div
                  key={book.id}
                  style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '12px',
                    position: 'relative',
                  }}
                >
                  {typeof onDeleteBook === 'function' ? (
                    <button
                      type="button"
                      aria-label={`Delete ${book.title}`}
                      onClick={() => onDeleteBook(book.id)}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '999px',
                        border: `1px solid ${theme.border}`,
                        background: theme.cardBg,
                        color: theme.error,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                  <div style={{ fontWeight: 'bold' }}>{book.title}</div>
                  <div style={{ fontSize: '13px', color: theme.textMuted }}>
                    by {book.author} | {book.genre} | ISBN: {book.isbn}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: theme.innerBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '18px' }}>
          <h4 style={{ margin: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 'bold' }}>Add a Book</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            <input
              type="text"
              placeholder="Book title"
              style={{ ...styles.loginInput, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#000000' }}
              value={newBookTitle}
              onChange={(e) => setNewBookTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Author"
              style={{ ...styles.loginInput, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#000000' }}
              value={newBookAuthor}
              onChange={(e) => setNewBookAuthor(e.target.value)}
            />
            <input
              type="text"
              placeholder="Genre"
              style={{ ...styles.loginInput, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#000000' }}
              value={newBookGenre}
              onChange={(e) => setNewBookGenre(e.target.value)}
            />
            <input
              type="text"
              placeholder="ISBN"
              style={{ ...styles.loginInput, backgroundColor: theme.bg, border: `1px solid ${theme.border}`, borderRadius: '10px', color: '#000000' }}
              value={newBookIsbn}
              onChange={(e) => setNewBookIsbn(e.target.value)}
            />
            <button style={{ ...styles.button, marginTop: '4px', backgroundColor: theme.primary }} onClick={onAddBook}>
              Add Book
            </button>
          </div>
          <div
            style={{
              marginTop: '10px',
              minHeight: '20px',
              color: addBookMessage.includes('success') ? theme.success : theme.error,
              fontSize: '13px',
            }}
          >
            {addBookMessage}
          </div>
        </div>

        <div style={{ background: theme.innerBg, border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '18px' }}>
          <h4 style={{ margin: 0, marginBottom: '14px', fontSize: '24px', fontWeight: 'bold' }}>Borrowed Books</h4>
          {borrowedBooks.length === 0 ? (
            <div style={{ color: theme.textMuted, fontSize: '14px' }}>No borrowed books right now.</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {borrowedBooks.map((book) => (
                <div
                  key={book.id}
                  style={{
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{book.title}</div>
                  <div style={{ fontSize: '13px', color: theme.textMuted }}>
                    Owner: {book.owner} | Due: {book.due}
                  </div>

                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px dashed ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: theme.textMuted }}>
                      {ratedBooks[book.title] ? 'Your rating:' : 'Rate this book:'}
                    </span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentScore = ratedBooks[book.title] || 0;
                        return (
                          <Star
                            key={star}
                            size={16}
                            fill={currentScore >= star ? theme.accent : 'none'}
                            color={currentScore >= star ? theme.accent : theme.textMuted}
                            style={{ cursor: ratedBooks[book.title] ? 'default' : 'pointer', transition: '0.2s' }}
                            onClick={() => handleStarClick(book.id, book.title, star)}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
