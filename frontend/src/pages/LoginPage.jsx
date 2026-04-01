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
  isLoginMode,
  setIsLoginMode,
  onLogin,
  onRegister,
}) {
  return (
    <div style={styles.loginWrapper}>
      <div style={styles.loginBox}>
        <div style={{ ...styles.logo, justifyContent: 'center', marginBottom: '10px' }}>
          <Sparkles size={32} />
          <span>BOOKABOOK</span>
        </div>

        <div style={{ textAlign: 'center', color: theme.textMuted, marginBottom: '20px' }}>
          {isLoginMode ? 'Welcome back, please log in' : 'Create a new account, join us'}
        </div>

        <div style={{ ...styles.errorText, color: errorMessage.includes('successful') ? theme.success : theme.error }}>
          {errorMessage}
        </div>

        <div style={styles.inputGroup}>
          <UserCircle size={20} color={theme.textMuted} />
          <input
            type="text"
            placeholder="Username"
            style={styles.loginInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={styles.inputGroup}>
          <Lock size={20} color={theme.textMuted} />
          <input
            type="password"
            placeholder="Password"
            style={styles.loginInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button style={styles.loginButton} onClick={isLoginMode ? onLogin : onRegister}>
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>

        <div
          style={styles.toggleText}
          onClick={() => {
            setIsLoginMode(!isLoginMode);
          }}
        >
          {isLoginMode ? 'No account? Click to register' : 'Already have an account? Click to log in'}
        </div>
      </div>
    </div>
  );
}
