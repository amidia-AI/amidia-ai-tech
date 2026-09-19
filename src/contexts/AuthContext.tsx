import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppUser = {
  uid?: string;
  username?: string;
  displayName?: string | null;
  isAdmin: boolean;
};

export interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: AppUser | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  loginAdmin: (username: string, password: string) => Promise<AuthResult>;
  signOut: () => void;
  getAuthToken: () => Promise<string | null>;
  clearAuthError: () => void;
  // Backward compatibility placeholders
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<AuthResult>;
  sendVerificationEmailToUser: () => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  authError: null,
  loginAdmin: async () => ({ success: false }),
  signOut: () => {},
  getAuthToken: async () => null,
  clearAuthError: () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signInWithGoogle: async () => ({ success: false, error: 'Sign in is strictly username and password.' }),
  sendVerificationEmailToUser: async () => ({ success: true }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const verifySavedAdminSession = async () => {
      try {
        const savedToken = localStorage.getItem('amidia_admin_token');
        if (!savedToken) {
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setIsAdmin(true);
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem('amidia_admin_token');
          localStorage.removeItem('amidia_admin_user');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySavedAdminSession();
  }, []);

  const loginAdmin = async (username: string, password: string): Promise<AuthResult> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem('amidia_admin_token', data.token);
        if (data.user) {
          localStorage.setItem('amidia_admin_user', JSON.stringify(data.user));
          setUser(data.user);
        } else {
          setUser({ username: username.trim(), isAdmin: true });
        }
        setIsAdmin(true);
        return { success: true };
      }

      const errMsg = data.error || 'Access denied: Invalid administrator credentials.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    } catch (err: any) {
      const errMsg = err.message || 'Network error while authenticating. Please try again.';
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const signOut = () => {
    localStorage.removeItem('amidia_admin_token');
    localStorage.removeItem('amidia_admin_user');
    setUser(null);
    setIsAdmin(false);
    setAuthError(null);
  };

  const getAuthToken = async (): Promise<string | null> => {
    return localStorage.getItem('amidia_admin_token') || null;
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        loginAdmin,
        signInWithGoogle: async () => ({ success: false, error: 'Sign in is strictly username and password.' }),
        signOut,
        getAuthToken,
        clearAuthError,
        isAuthModalOpen: false,
        openAuthModal: () => {},
        closeAuthModal: () => {},
        sendVerificationEmailToUser: async () => ({ success: true }),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
