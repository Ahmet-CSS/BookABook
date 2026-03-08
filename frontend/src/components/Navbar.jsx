import React from 'react';
import { Search, Sparkles, LogOut } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function Navbar({ view, setView, search, setSearch, onLogout }) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <Sparkles size={28} />
        <span>YORU SHARE</span>
      </div>

      <div style={styles.searchBox}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: theme.textMuted }} />
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
        <button style={styles.navBtn(view === 'profile')} onClick={() => setView('profile')}>Profile</button>

        <div style={{ width: '1px', height: '20px', backgroundColor: theme.border, margin: '0 10px' }}></div>
        <button style={styles.logoutBtn} onClick={onLogout} title="logout">
          <LogOut size={16} /> logout
        </button>
      </div>
    </nav>
  );
}
