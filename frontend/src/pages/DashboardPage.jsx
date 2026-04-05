import React from 'react';
import { Book, Clock, User } from 'lucide-react';
import { theme } from '../styles/theme';

const getExchangeField = (request, camelKey, snakeKey) => request[camelKey] || request[snakeKey] || '';

export default function DashboardPage({
  borrowedBooks,
  borrowRequests = [],
  receivedBorrowRequests = [],
  exchangeRequests = [],
  reservations = [],
  onUndoBorrowRequest,
  onOpenChat,
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Book size={20} /> Currently Borrowing
        </h3>
        {borrowedBooks.length === 0 ? (
          <div style={{ color: theme.textMuted }}>You have not borrowed any books yet.</div>
        ) : (
          borrowedBooks.map((item) => (
            <div key={item.id} style={{ padding: '15px', background: theme.bg, borderRadius: '15px', borderLeft: `4px solid ${theme.secondary}` }}>
              <div style={{ fontWeight: 'bold' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>Due Date: {item.due}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Book size={20} /> My Reservations
        </h3>
        {reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textMuted }}>
            <Clock size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
            <div>No active reservations.</div>
          </div>
        ) : (
          reservations.map((reservation) => (
            <div
              key={reservation.id}
              style={{
                padding: '15px',
                background: theme.bg,
                borderRadius: '15px',
                borderLeft: `4px solid ${theme.primary}`,
                marginBottom: '10px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{reservation.book_title}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Status: {reservation.status}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} /> My Borrow Requests
        </h3>
        {borrowRequests.length === 0 ? (
          <div style={{ color: theme.textMuted }}>No borrow requests yet.</div>
        ) : (
          borrowRequests.map((request) => (
            <div
              key={request.id}
              style={{
                padding: '15px',
                background: theme.bg,
                borderRadius: '15px',
                borderLeft: `4px solid ${theme.primary}`,
                marginBottom: '10px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{request.book_title}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Borrower: {request.borrower}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Status: {request.status}</div>
              {request.status === 'pending' && typeof onUndoBorrowRequest === 'function' ? (
                <button
                  style={{
                    marginTop: '10px',
                    background: 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.error,
                    cursor: 'pointer',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onUndoBorrowRequest(request.id)}
                >
                  Undo Request
                </button>
              ) : null}
              {request.book_owner ? (
                <button
                  style={{
                    marginTop: '10px',
                    marginLeft: request.status === 'pending' && typeof onUndoBorrowRequest === 'function' ? '10px' : '0',
                    background: theme.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onOpenChat?.(request.book_owner)}
                >
                  Message
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} /> My Exchange Requests
        </h3>
        {exchangeRequests.length === 0 ? (
          <div style={{ color: theme.textMuted }}>No exchange requests yet.</div>
        ) : (
          exchangeRequests.map((request) => (
            <div
              key={request.id}
              style={{
                padding: '15px',
                background: theme.bg,
                borderRadius: '15px',
                borderLeft: `4px solid ${theme.secondary}`,
                marginBottom: '10px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{getExchangeField(request, 'requestedBookTitle', 'requested_book_title')}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Owner: {getExchangeField(request, 'owner', 'requested_book_owner')}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Offered Book: {getExchangeField(request, 'offeredBookTitle', 'offered_book_title')}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Status: {request.status}</div>
              {getExchangeField(request, 'owner', 'requested_book_owner') ? (
                <button
                  style={{
                    marginTop: '10px',
                    background: theme.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onOpenChat?.(getExchangeField(request, 'owner', 'requested_book_owner'))}
                >
                  Message
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary }}>
          <User size={20} /> Lending Requests
        </h3>
        {receivedBorrowRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textMuted }}>
            <Clock size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
            <div>No one has asked for your books yet.</div>
          </div>
        ) : (
          receivedBorrowRequests.map((request) => (
            <div
              key={request.id}
              style={{
                padding: '15px',
                background: theme.bg,
                borderRadius: '15px',
                borderLeft: `4px solid ${theme.primary}`,
                marginBottom: '10px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{request.book_title}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Borrower: {request.borrower}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>Status: {request.status}</div>
              {request.borrower ? (
                <button
                  style={{
                    marginTop: '10px',
                    background: theme.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onOpenChat?.(request.borrower)}
                >
                  Message
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
