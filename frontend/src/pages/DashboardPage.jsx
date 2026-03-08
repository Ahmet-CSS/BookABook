import React from 'react';
import { Book, User, Clock } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function DashboardPage({ borrowedBooks, borrowRequests = [], exchangeRequests = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Book size={20} /> Currently Borrowing
        </h3>
        {borrowedBooks.map((item) => (
          <div key={item.id} style={{ padding: '15px', background: theme.bg, borderRadius: '15px', borderLeft: `4px solid ${theme.secondary}` }}>
            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
            <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '5px' }}>Due Date: {item.due}</div>
          </div>
        ))}
      </div>

      {/* Placeholder for Borrowing Requests */}
      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
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
              <div style={{ fontWeight: 'bold' }}>{request.bookTitle}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                Owner: {request.owner}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                Status: {request.status}
              </div>
            </div>
          ))
        )}
      </div>


              {/* Placeholder for Exchange Requests */}
      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
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
              <div style={{ fontWeight: 'bold' }}>{request.requestedBookTitle}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                Owner: {request.owner}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                Offered Book: {request.offeredBookTitle}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>
                Status: {request.status}
              </div>
            </div>
          ))
        )}
      </div>


      
      <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}` }}>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: theme.primary,
          }}
        >
          <User size={20} /> Lending Requests
        </h3>
        
        <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textMuted }}>
          <Clock size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
          <div>No pending requests...</div>
        </div>
      </div>
    </div>



  );
}
