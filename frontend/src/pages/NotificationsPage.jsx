import React from 'react';
import { Bell, BookOpen, Repeat, Inbox } from 'lucide-react';
import { theme } from '../styles/theme';

export default function NotificationsPage({ borrowRequests = [], exchangeRequests = [] }) {
  const hasNotifications = borrowRequests.length > 0 || exchangeRequests.length > 0;

  function renderNotificationBox(icon, lineColor, boxColor, title, message, key) {
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
              request.book_title || 'Borrow request',
              `Borrow request status: ${request.status || 'Pending'}`,
              `borrow-${request.id}`
            )
          )}

          {exchangeRequests.map((request) =>
            renderNotificationBox(
              <Repeat size={18} />,
              theme.secondary,
              `${theme.secondary}22`,
              request.requestedBookTitle || 'Exchange request',
              `Offered book: ${request.offeredBookTitle || 'Unknown book'} | Status: ${request.status || 'Pending'}`,
              `exchange-${request.id}`
            )
          )}
        </div>
      )}
    </div>
  );
}
