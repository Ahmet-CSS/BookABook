import React from 'react';
import { Bell, BookOpen, Inbox, User } from 'lucide-react';
import { theme } from '../styles/theme';

export default function NotificationsPage({
  borrowRequests = [],
  receivedBorrowRequests = [],
  onUndoBorrowRequest,
}) {
  const hasNotifications = borrowRequests.length > 0 || receivedBorrowRequests.length > 0;

  function renderNotificationBox(icon, lineColor, boxColor, title, message, key, showUndoButton, requestId) {
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
              true,
              request.id
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
              request.id
            )
          )}
        </div>
      )}
    </div>
  );
}
