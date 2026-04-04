import React from 'react';
import { Bell, BookOpen, Inbox, User } from 'lucide-react';
import { theme } from '../styles/theme';

export default function NotificationsPage({
  borrowRequests = [],
  receivedBorrowRequests = [],
  onUndoBorrowRequest,
  onAcceptBorrowRequest,
  onRejectBorrowRequest,
  exchangeRequests = [],
  receivedExchangeRequests = [],
  onAcceptExchangeRequest,
  onRejectExchangeRequest,
  
}) {
  const hasNotifications = borrowRequests.length > 0 || receivedBorrowRequests.length > 0 || exchangeRequests.length > 0 || receivedExchangeRequests.length > 0;

  function renderNotificationBox(icon, lineColor, boxColor, title, message, key, showUndoButton, requestId, showActionButtons, isExchangeAction = false) {
    return (
      <div
        key={key}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: theme.innerBg,
          border: `1px solid ${theme.border}`,
          borderLeft: `4px solid ${lineColor}`,
          borderRadius: '16px',
          padding: '16px 18px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            background: boxColor,
            color: lineColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '14px', color: theme.textMuted }}>{message}</div>
          {showUndoButton ? (
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
              onClick={() => onUndoBorrowRequest(requestId)}
            >
              Undo Request
            </button>
          ) : null}
          {showActionButtons ? (
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                style={{
                  background: theme.success,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                onClick={() => 
                  isExchangeAction ? onAcceptExchangeRequest(requestId) : onAcceptBorrowRequest(requestId)
                }
              >
                Accept
              </button>
              <button
                style={{
                  background: theme.error,
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                onClick={() => isExchangeAction ? onRejectExchangeRequest(requestId) : onRejectBorrowRequest(requestId) }
              >
                Reject
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
      <h2 style={{ fontSize: '32px', fontWeight: '900', marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bell size={28} /> Notifications
      </h2>

      {!hasNotifications ? (
        <div
          style={{
            textAlign: 'center',
            color: theme.textMuted,
            background: theme.innerBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '18px',
            padding: '40px 20px',
          }}
        >
          <Inbox size={32} style={{ marginBottom: '12px', opacity: 0.45 }} />
          <div>No notifications yet.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {borrowRequests.map((request) =>
            renderNotificationBox(
              <BookOpen size={18} />,
                theme.primary,
                `${theme.primary}22`,
                'Borrowing a book',
                `You asked to borrow "${request.book_title || 'a book'}". Status: ${request.status || 'Pending'}`,
                `borrow-${request.id}`,
                request.status === 'pending',
                request.id,
                false
            )
          )}

          {receivedBorrowRequests.map((request) =>
            renderNotificationBox(
              <User size={18} />,
              theme.secondary,
              `${theme.secondary}22`,
              'Someone wants your book',
              `${request.borrower || 'A user'} wants to borrow "${request.book_title || 'your book'}". Status: ${request.status || 'Pending'}`,
              `received-${request.id}`,
              false,
              request.id,
              request.status === 'pending'
            )
          )}

          {exchangeRequests.map((request) =>
            renderNotificationBox(
              <BookOpen size={18} />,
                theme.accent,
                `${theme.accent}22`,
                'Exchange request sent',
                `You requested to exchange "${request.requestedBookTitle || 'a book'}". Status: ${request.status || 'Pending'}`,
                `exchange-${request.id}`,
                false,
                request.id,
                false
            )
          )}
          {receivedExchangeRequests.map((request) =>
            renderNotificationBox(
              <User size={18} />,
              theme.secondary,
              `${theme.secondary}22`,
              'Exchange request received',
              `${request.requester || 'A user'} wants to exchange "${request.requestedBookTitle || 'a book'}". Status: ${request.status || 'Pending'}`,
              `received-exchange-${request.id}`,
              false,
              request.id,
              request.status === 'pending',
              true
            )
          )}
        </div>
      )}
    </div>
  );
}
