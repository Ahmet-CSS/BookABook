import React, { useState } from 'react';
import { Search, Book, User, Star, Clock, Check, X, Sparkles, LayoutDashboard } from 'lucide-react';


const theme = {
  bg: '#05050a',
  cardBg: '#111118',
  innerBg: '#0a0a0f',
  border: '#22222b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  primary: '#ff007f', // Neon Pink
  secondary: '#6366f1', // Indigo
  accent: '#fbbf24', // Amber/Gold
  success: '#10b981', // Emerald
};

const styles = {
  container: {
    backgroundColor: theme.bg,
    color: theme.text,
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '20px',
  },
  navbar: {
    maxWidth: '1000px',
    margin: '0 auto 40px auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.border}`,
    flexWrap: 'wrap',
    gap: '20px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: theme.primary,
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '-1px',
    textTransform: 'uppercase',
  },
  searchBox: {
    position: 'relative',
    flex: '1',
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    backgroundColor: theme.innerBg,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '10px 15px 10px 40px',
    color: theme.text,
    outline: 'none',
  },
  navButtons: {
    display: 'flex',
    gap: '15px',
  },
  navBtn: (active) => ({
    background: 'none',
    border: 'none',
    color: active ? theme.primary : theme.textMuted,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: '0.3s',
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: theme.cardBg,
    borderRadius: '24px',
    border: `1px solid ${theme.border}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    transition: '0.3s',
  },
  badge: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: theme.primary,
    backgroundColor: `${theme.primary}15`,
    padding: '4px 10px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
    marginBottom: '10px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: theme.secondary,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
  }
};

// Mock Data
const MOCK_BOOKS = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Cormen', genre: 'CS', owner: 'Alice', rating: 4.8 },
  { id: 2, title: 'Sword Art Online', author: 'Reki Kawahara', genre: 'Manga', owner: 'Kirito', rating: 4.9 },
  { id: 3, title: 'Frieren: Beyond Journey', author: 'Kanehito', genre: 'Manga', owner: 'Fern', rating: 5.0 },
];

const MOCK_BORROWED = [
  { id: 101, title: 'Design Patterns', owner: 'Eve', due: '2026-03-01' },
];

// Main App Component

export default function App() {
  const [view, setView] = useState('browse');
  const [search, setSearch] = useState('');

  const filteredBooks = MOCK_BOOKS.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <Sparkles size={28} />
          <span>YORU SHARE</span>
        </div>

        <div style={styles.searchBox}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '12px', color: theme.textMuted}} />
          <input 
            type="text" 
            placeholder="Search grimoires..." 
            style={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.navButtons}>
          <button style={styles.navBtn(view === 'browse')} onClick={() => setView('browse')}>Discover</button>
          <button style={styles.navBtn(view === 'dashboard')} onClick={() => setView('dashboard')}>Dashboard</button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{maxWidth: '1000px', margin: '0 auto'}}>
        {view === 'browse' ? (
          <div>
            <h2 style={{fontSize: '32px', fontWeight: '900', marginBottom: '30px'}}>LIBRARY CATALOG</h2>
            <div style={styles.grid}>
              {filteredBooks.map(book => (
                <div key={book.id} style={styles.card}>
                  <div style={styles.badge}>{book.genre}</div>
                  <h3 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '5px'}}>{book.title}</h3>
                  <p style={{color: theme.textMuted, fontSize: '14px', marginBottom: '20px italic'}}>by {book.author}</p>
                  
                  {/* Owner Info Block */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', background: theme.innerBg, padding: '12px', borderRadius: '16px', marginBottom: '20px'}}>
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${book.owner}`} 
                      style={styles.avatar} 
                      alt="avatar"
                    />
                    <div style={{flex: 1}}>
                      <div style={{fontSize: '10px', color: theme.textMuted, fontWeight: 'bold'}}>OWNER</div>
                      <div style={{fontSize: '14px', fontWeight: 'bold'}}>{book.owner}</div>
                    </div>
                    <div style={{color: theme.accent, fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <Star size={12} fill="currentColor" /> {book.rating}
                    </div>
                  </div>

                  <button style={styles.button}>Request Borrow</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
             <div style={{background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}`}}>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <Book size={20} /> Currently Borrowing
                </h3>
                {MOCK_BORROWED.map(item => (
                  <div key={item.id} style={{padding: '15px', background: theme.bg, borderRadius: '15px', borderLeft: `4px solid ${theme.secondary}`}}>
                    <div style={{fontWeight: 'bold'}}>{item.title}</div>
                    <div style={{fontSize: '12px', color: theme.textMuted, marginTop: '5px'}}>Due Date: {item.due}</div>
                  </div>
                ))}
             </div>

             <div style={{background: theme.cardBg, padding: '30px', borderRadius: '24px', border: `1px solid ${theme.border}`}}>
                <h3 style={{fontSize: '20px', fontWeight: 'bold', borderBottom: `1px solid ${theme.border}`, paddingBottom: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: theme.primary}}>
                  <User size={20} /> Lending Requests
                </h3>
                <div style={{textAlign: 'center', padding: '40px 0', color: theme.textMuted}}>
                  <Clock size={32} style={{marginBottom: '10px', opacity: 0.3}} />
                  <div>No pending requests...</div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}