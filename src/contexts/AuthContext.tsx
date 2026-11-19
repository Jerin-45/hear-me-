import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemoUser: () => void;
  isFirebaseConnected: boolean;
}

const LOCAL_USER_KEY = 'hearme_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading stored user', e);
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'HearMe User',
            photoURL: fbUser.photoURL,
            createdAt: fbUser.metadata.creationTime,
          };
          setUser(profile);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_USER_KEY);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Offline/Local Demo state
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) throw new Error('Email and password are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    if (isFirebaseConfigured) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      // Local authenticated session
      const profile: UserProfile = {
        uid: 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        displayName: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'HearMe User',
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    if (!email || !password || !displayName) throw new Error('All fields are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    if (isFirebaseConfigured) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await updateProfile(res.user, { displayName });
        const profile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email,
          displayName,
          createdAt: new Date().toISOString(),
        };
        setUser(profile);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
      }
    } else {
      const profile: UserProfile = {
        uid: 'usr_' + Math.random().toString(36).substring(2, 10),
        email,
        displayName,
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const loginAsDemoUser = () => {
    const demoProfile: UserProfile = {
      uid: 'demo-user-accessibility-champion',
      email: 'accessibility.champion@hearme.ai',
      displayName: 'Alex Chen',
      createdAt: new Date().toISOString(),
    };
    setUser(demoProfile);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        loginAsDemoUser,
        isFirebaseConnected: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
