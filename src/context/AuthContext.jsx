import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  STORAGE_KEYS,
  clearStoredSession,
  getStoredToken,
  persistAuthState,
  pickFirst,
  setStoredToken,
} from '../utils/authStorage';

const AuthContext = createContext(null);

const getInitialUser = () => ({
  userName: pickFirst([STORAGE_KEYS.userName]),
  userGroup: pickFirst([STORAGE_KEYS.userGroup]),
  mobileNumber: pickFirst([STORAGE_KEYS.mobileNumber]),
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(getInitialUser);

  const login = useCallback((nextToken, userData = {}) => {
    setStoredToken(nextToken || '');
    setToken(nextToken || '');

    const nextUser = {
      userName: userData.userName || '',
      userGroup: userData.userGroup || '',
      mobileNumber: userData.mobileNumber || '',
    };

    persistAuthState(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setToken('');
    setUser({ userName: '', userGroup: '', mobileNumber: '' });
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      userName: user.userName,
      userGroup: user.userGroup,
      mobileNumber: user.mobileNumber,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
