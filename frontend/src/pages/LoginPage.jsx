import React from 'react';
import { Sparkles, Lock, UserCircle } from 'lucide-react';
import { styles } from '../styles/styles';
import { theme } from '../styles/theme';

export default function LoginPage({
  username,
  setUsername,
  password,
  setPassword,
  errorMessage,
  onLogin
}) {
  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginBox}>

        {/* Logo */}
        <div style={{...styles.logo, justifyContent: 'center', marginBottom: '10px'}}>
          <Sparkles size={32} />
          <span>YORU SHARE</span>
        </div>

        <div style={{textAlign: 'center', color: theme.textMuted, marginBottom: '20px'}}>
          LoveLove yoru book share, share your love with others
        </div>

        {/* error */}
        <div style={styles.errorText}>{errorMessage}</div>

        {/* user input bar */}
        <div style={styles.inputGroup}>
          <UserCircle size={20} color={theme.textMuted} />
          <input
            type="text"
            placeholder="plese enter username"
            style={styles.loginInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* pw input bar */}
        <div style={styles.inputGroup}>
          <Lock size={20} color={theme.textMuted} />
          <input
            type="password"
            placeholder="plese enter password"
            style={styles.loginInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* login btn */}
        <button
          style={styles.loginButton}
          onClick={onLogin}
        >
          Login
        </button>

      </div>
    </div>
  );
}