import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { FirebaseError } from 'firebase/app';
import { User } from '@/types';
import { firebaseAuth, firebaseDb, isFirebaseConfigured } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string) => Promise<{ error?: string }>;
  /** Firebase only. Uses redirect (avoids COOP/popup issues). Browser leaves the page to Google. */
  signInWithGoogle: () => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateInterests: (interests: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function firebaseErrorMessage(err: unknown): string {
  const code = err && typeof err === 'object' && 'code' in err ? String((err as FirebaseError).code) : '';
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
    return 'No account found or incorrect credentials';
  }
  if (code === 'auth/wrong-password') return 'Incorrect password';
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists';
  if (code === 'auth/invalid-email') return 'Invalid email address';
  if (code === 'auth/weak-password') return 'Password is too weak';
  if (code === 'auth/popup-closed-by-user') return 'Sign-in was cancelled';
  if (code === 'auth/cancelled-popup-request') return 'Another sign-in is already in progress';
  if (code === 'auth/account-exists-with-different-credential') {
    return 'This email already uses a different sign-in method';
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && firebaseAuth && firebaseDb) {
      void getRedirectResult(firebaseAuth).catch((e) => {
        console.warn(
          "[PodNotes] getRedirectResult failed (you may not be returning from Google sign-in, or the network blocked Google):",
          e,
        );
      });

      const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (!fbUser) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        try {
          const ref = doc(firebaseDb, 'users', fbUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            try {
              await setDoc(ref, {
                email: fbUser.email ?? '',
                interests: [],
                createdAt: serverTimestamp(),
              });
            } catch (writeErr) {
              console.error('[PodNotes] Could not create user profile in Firestore (check rules & network):', writeErr);
              throw writeErr;
            }
          }
          const latest = await getDoc(ref);
          const data = latest.data();
          const interests = (data?.interests as string[] | undefined) ?? [];
          const createdAt = data?.createdAt?.toDate?.() ?? new Date();
          setUser({
            id: fbUser.uid,
            email: fbUser.email ?? '',
            interests,
            createdAt,
          });
        } catch (err) {
          // Common when identitytoolkit/firestore.googleapis.com time out (firewall, VPN, captive Wi‑Fi, region blocks).
          console.warn(
            "[PodNotes] Firestore unreachable — signed-in profile not loaded. Check internet, VPN, or firewall for *.googleapis.com",
            err,
          );
          setUser({
            id: fbUser.uid,
            email: fbUser.email ?? '',
            interests: [],
            createdAt: new Date(),
          });
        } finally {
          setIsLoading(false);
        }
      });
      return () => unsub();
    }

    const storedUser = localStorage.getItem('podnotes_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as Record<string, unknown>;
        setUser({
          id: String(parsed.id),
          email: String(parsed.email),
          interests: (parsed.interests as string[]) ?? [],
          createdAt: new Date(parsed.createdAt as string),
        });
      } catch {
        localStorage.removeItem('podnotes_user');
      }
    }
    setIsLoading(false);
    return undefined;
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return {};
      } catch (e) {
        return { error: firebaseErrorMessage(e) };
      }
    }

    const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
    if (!users[email]) {
      return { error: 'No account found with this email' };
    }
    if (users[email].password !== password) {
      return { error: 'Incorrect password' };
    }
    const userData: User = {
      id: users[email].id,
      email,
      interests: users[email].interests || [],
      createdAt: new Date(users[email].createdAt),
    };
    setUser(userData);
    localStorage.setItem('podnotes_user', JSON.stringify(userData));
    return {};
  };

  const signup = async (email: string, password: string): Promise<{ error?: string }> => {
    if (isFirebaseConfigured && firebaseAuth && firebaseDb) {
      try {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        await setDoc(doc(firebaseDb, 'users', credential.user.uid), {
          email,
          interests: [],
          createdAt: serverTimestamp(),
        });
        return {};
      } catch (e) {
        return { error: firebaseErrorMessage(e) };
      }
    }

    const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
    if (users[email]) {
      return { error: 'An account with this email already exists' };
    }
    const newUser = {
      id: crypto.randomUUID(),
      email,
      password,
      interests: [],
      createdAt: new Date().toISOString(),
    };
    users[email] = newUser;
    localStorage.setItem('podnotes_users', JSON.stringify(users));
    const userData: User = {
      id: newUser.id,
      email,
      interests: [],
      createdAt: new Date(),
    };
    setUser(userData);
    localStorage.setItem('podnotes_user', JSON.stringify(userData));
    return {};
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (!isFirebaseConfigured || !firebaseAuth || !firebaseDb) {
      return {
        error: 'Google sign-in requires Firebase (add VITE_FIREBASE_* in .env.local).',
      };
    }
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(firebaseAuth, provider);
      return {};
    } catch (e) {
      return { error: firebaseErrorMessage(e) };
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      await signOut(firebaseAuth);
    }
    setUser(null);
    localStorage.removeItem('podnotes_user');
  };

  const updateInterests = async (interests: string[]) => {
    if (isFirebaseConfigured && firebaseAuth?.currentUser && firebaseDb) {
      await updateDoc(doc(firebaseDb, 'users', firebaseAuth.currentUser.uid), { interests });
    }
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, interests };
      if (!isFirebaseConfigured) {
        localStorage.setItem('podnotes_user', JSON.stringify(updated));
        const users = JSON.parse(localStorage.getItem('podnotes_users') || '{}');
        if (users[prev.email]) {
          users[prev.email].interests = interests;
          localStorage.setItem('podnotes_users', JSON.stringify(users));
        }
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, signInWithGoogle, logout, updateInterests }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
