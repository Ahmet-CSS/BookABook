import React, { useState } from 'react';
import { Trophy, Medal, BookOpen, Star } from 'lucide-react';

// Theme configuration for consistency
const theme = {
  primary: '#ff007f',
  accent: '#fbbf24',
  textMuted: '#94a3b8',
  border: '#22222b',
  cardBg: '#111118',
  innerBg: '#0a0a0f',
};

const RankPage = ({ books = [] }) => {
  const [filter, setFilter] = useState('All');

  // Extract unique genres for the filter tabs
  const genres = ['All', ...new Set(books.map(b => b.genre))];
  
  // Sort by rating (descending) and apply genre filter
  const rankedBooks = [...books]
    .filter(b => filter === 'All' || b.genre === filter)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Trophy size={36} color={theme.accent} />
          <div>
            <h2 style={styles.title}>Book Leaderboard</h2>
            <p style={styles.subtitle}>Explore the highest-rated literature in the Yoru collection</p>
          </div>
        </div>
        
        {/* Genre filter tabs */}
        <div style={styles.filterContainer}>
          {genres.map(g => (
            <button 
              key={g} 
              onClick={() => setFilter(g)}
              style={styles.filterTab(filter === g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.list}>
        {/* Table Header */}
        <div style={styles.listHeader}>
          <div style={{ width: '40px', textAlign: 'center' }}>Rank</div>
          <div style={{ flex: 1 }}>Book Details</div>
          <div style={{ width: '100px', textAlign: 'right' }}>Community Rating</div>
        </div>

        {/* Rank Rows */}
        {rankedBooks.length > 0 ? rankedBooks.map((book, index) => (
          <div key={book.id} style={styles.row}>
            <div style={styles.rankNum(index + 1)}>{index + 1}</div>
            
            <div style={styles.bookInfo}>
              <div style={styles.bookIcon}>
                <BookOpen size={20} />
              </div>
              <div>
                <div style={styles.bookTitle}>
                  {book.title}
                  {/* Show medal for top 1 of the 'All' category */}
                  {index === 0 && filter === 'All' && <Medal size={16} color={theme.accent} />}
                </div>
                <div style={styles.bookMeta}>
                  {book.author} · <span style={{color: theme.primary}}>{book.genre}</span>
                </div>
              </div>
            </div>

            <div style={styles.ratingBox}>
              <span style={styles.ratingValue}>{book.rating}</span>
              <Star size={14} fill={theme.accent} color={theme.accent} />
            </div>
          </div>
        )) : (
          <div style={styles.emptyState}>No book data available for this category.</div>
        )}
      </div>
    </div>
  );
};

// CSS-in-JS styles
const styles = {
  container: { width: '100%' },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginBottom: '30px', 
    flexWrap: 'wrap', 
    gap: '20px' 
  },
  titleSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  title: { fontSize: '32px', fontWeight: '900', margin: 0 },
  subtitle: { color: theme.textMuted, fontSize: '14px', margin: '5px 0 0 0' },
  filterContainer: { 
    display: 'flex', 
    gap: '8px', 
    background: theme.cardBg, 
    padding: '6px', 
    borderRadius: '14px', 
    border: `1px solid ${theme.border}` 
  },
  filterTab: (active) => ({
    padding: '8px 16px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: active ? theme.primary : 'transparent',
    color: active ? 'white' : theme.textMuted,
    border: 'none',
    transition: '0.2s',
  }),
  list: { display: 'flex', flexDirection: 'column' },
  listHeader: { 
    display: 'flex', 
    padding: '10px 20px', 
    color: theme.textMuted, 
    fontSize: '12px', 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 20px',
    backgroundColor: theme.cardBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '20px',
    marginBottom: '12px',
    gap: '20px',
  },
  rankNum: (rank) => ({
    width: '40px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '900',
    color: rank === 1 ? theme.accent : rank === 2 ? '#cbd5e1' : rank === 3 ? '#b45309' : theme.textMuted,
  }),
  bookInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: '15px' },
  bookIcon: { background: `${theme.primary}15`, padding: '10px', borderRadius: '12px', color: theme.primary },
  bookTitle: { fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  bookMeta: { fontSize: '12px', color: theme.textMuted },
  ratingBox: { display: 'flex', alignItems: 'center', gap: '6px' },
  ratingValue: { fontWeight: '900', color: theme.accent, fontSize: '18px' },
  emptyState: { textAlign: 'center', padding: '50px', color: theme.textMuted }
};

export default RankPage;