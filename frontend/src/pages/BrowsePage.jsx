import React, { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function BrowsePage({
  books,
  onBorrowRequest,
  borrowRequests = [],
  username,
  onExchangeRequest,
  exchangeRequests = [],
  onReserveRequest,
  onCancelReservation,
  reservations = [],
}) {

  const [activeGenre, setActiveGenre] = useState('All');

  const genres = ['All', ...new Set(books.map(book => book.genre))];

  const displayedBooks = books.filter(book => 
    activeGenre === 'All' ? true : book.genre === activeGenre
  );

  const hasExchangeRequest = (book) =>
    exchangeRequests.some((request) => {
      const requestedTitle = request.requestedBookTitle || request.requested_book_title;
      const requestedOwner = request.owner || request.requested_book_owner;
      return requestedTitle === book.title && requestedOwner === book.owner;
    });

  return (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>LIBRARY CATALOG</h2>

      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap', 
        alignItems: 'center',
        padding: '10px 0'
      }}>
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            style={{  
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${activeGenre === genre ? theme.primary : theme.border}`,
              background: activeGenre === genre ? theme.primary : theme.cardBg,
              color: activeGenre === genre ? 'white' : theme.textMuted,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
            >
            {activeGenre === genre && <Check size={14} />}
            {genre}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {displayedBooks.map((book) => (
          <div key={book.id} style={styles.card}>
            <div style={styles.badge}>{book.genre}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '5px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{book.title}</h3>
              <div
                style={{
                  color: theme.accent,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Star size={14} fill="currentColor" /> {book.rating}
              </div>
            </div>
            <p style={{ color: theme.textMuted, fontSize: '14px', marginBottom: '20px italic' }}>by {book.author}</p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: theme.innerBg,
                padding: '12px',
                borderRadius: '16px',
                marginBottom: '20px',
              }}
            >
              <img src={'/avatar.jpg'} style={styles.avatar} alt="avatar" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: 'bold' }}>OWNER</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{book.owner}</div>
              </div>
            </div>

            <button style={styles.button}
            onClick={() => onBorrowRequest(book)}
            disabled={borrowRequests.some(
            (request) => request.book === book.id && request.borrower === username)} >
            {borrowRequests.some(
           (request) => request.book === book.id && request.borrower === username )
          ? 'Requested'
          : 'Request Borrow'}</button>

          <button
          style={{ ...styles.button, background: theme.secondary, marginTop: '10px' }}
          onClick={() => onExchangeRequest(book)}
          disabled={hasExchangeRequest(book)}
          >
            {hasExchangeRequest(book)
              ? 'Exchange Requested'
              : 'Request Exchange'}
          </button>

          {book.status === 'unavailable' && (() => {
            const existingReservation = reservations.find(
              (reservation) => reservation.book === book.id && reservation.reserver === username
            );
            return (
              <button
           style={{ ...styles.button, background: theme.error, marginTop: '10px' }}
            onClick={() => {
              if (existingReservation) {
                onCancelReservation(existingReservation.id);
              } else {
                onReserveRequest(book);
              }
            }}
            >
            {existingReservation ? 'Cancel Reservation' : 'Reserve'}
            </button>
          );
  })()}
   


          </div>
        ))}

        {displayedBooks.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', background: theme.cardBg, borderRadius: '24px', border: `1px dashed ${theme.border}`, color: theme.textMuted }}>
            No books found for "{activeGenre}".
          </div>
        )}
        
      </div>
    </div>
  );
}
