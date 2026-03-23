import React from 'react';
import { Star, User } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function BrowsePage({ books, onBorrowRequest, borrowRequests = [], username,  onExchangeRequest, exchangeRequests = [], 
  myBooks = [], selectedExchangeBook, setSelectedExchangeBook, onReserveRequest, reservations = [] }) {
  return (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '30px' }}>LIBRARY CATALOG</h2>
      <div style={styles.grid}>
        {books.map((book) => (
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
          disabled={exchangeRequests.some(
            (request) => request.requestedBookTitle === book.title && request.owner === book.owner
          )}
          >
            {exchangeRequests.some(
              (request) => request.requestedBookTitle === book.title && request.owner === book.owner
            )
              ? 'Exchange Requested'
              : 'Request Exchange'}
          </button>

          {book.status === 'unavailable' && (
          <button
           style={{ ...styles.button, background: theme.error, marginTop: '10px' }}
            onClick={() => onReserveRequest(book)}
              disabled={reservations.some(
                (reservation) => reservation.book === book.id && reservation.reserver === username
              )}
              >
             {reservations.some(
                (reservation) => reservation.book === book.id && reservation.reserver === username
              )
              ? 'Reserved'
              : 'Reserve Book'}
            </button>
)}
          </div>
        ))}
      </div>
    </div>
  );
}
