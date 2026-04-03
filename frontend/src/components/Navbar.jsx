import React from 'react';
import { Search, Sparkles, LogOut, Bell, MessageSquare } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

function DotBadge() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '999px',
        background: theme.error,
        marginLeft: '6px',
        verticalAlign: 'middle',
        boxShadow: `0 0 0 2px ${theme.bg}`,
      }}
    />
  );
}

export default function Navbar({
  view,
  setView,
  search,
  setSearch,
  onLogout,
  hasUnreadNotifications = false,
  hasUnreadChat = false,
}) {
  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <Sparkles size={28} />
        <span>BOOKABOOK</span>
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
        <button style={styles.navBtn(view === 'notifications')} onClick={() => setView('notifications')}>
          <Bell size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
          Notifications
          {hasUnreadNotifications ? <DotBadge /> : null}
        </button>
        <button style={styles.navBtn(view === 'chat')} onClick={() => setView('chat')}>
          <MessageSquare size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
          Chat
          {hasUnreadChat ? <DotBadge /> : null}
        </button>
        <button style={styles.navBtn(view === 'profile')} onClick={() => setView('profile')}>Profile</button>
        <button style={styles.navBtn(view === 'rank' )} onClick={() => setView('rank')}>Rank</button>

        <div style={{ width: '1px', height: '20px', backgroundColor: theme.border, margin: '0 10px' }}></div>
        <button style={styles.logoutBtn} onClick={onLogout} title="logout">
          <LogOut size={16} /> logout
        </button>
      </div>
    </nav>
  );
}
