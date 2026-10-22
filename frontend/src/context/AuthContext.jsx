import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch, readJson } from '../lib/api';

const AuthContext = createContext(undefined);
const TOKEN_STORAGE_KEY = 'smart_journal_auth_token';
const USER_STORAGE_KEY = 'smart_journal_auth_user';

function storedUser() {
  try { const value = localStorage.getItem(USER_STORAGE_KEY); return value ? JSON.parse(value) : null; }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(storedUser);
  const [isLoading, setIsLoading] = useState(false);

  const authFetch = useCallback((url, options = {}) => apiFetch(url, options), []);

  const login = (authData) => {
    const nextToken = authData.access_token || authData.token;
    if (!nextToken) throw new Error('Authentication response did not contain a token.');
    const nextUser = authData.user || { id: authData.user_id || null, email: authData.email || 'Account', name: authData.name || (authData.email || 'Account').split('@')[0] };
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updated) => {
    // The current FastAPI backend does not expose a profile endpoint, so keep UI profile data locally.
    const next = { ...user, ...updated };
    setUser(next);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
  };

  const authenticate = async (email, password, mode = 'login', name = '') => {
    const path = mode === 'register' ? '/auth/register' : '/auth/login';
    const body = mode === 'register' ? { email, password } : { email, password };
    const data = await readJson(await apiFetch(path, { method: 'POST', body: JSON.stringify(body) }));
    login({ ...data, email, name: name || email.split('@')[0] });
    return { ...data, email, name: name || email.split('@')[0] };
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, authFetch, authenticate }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
