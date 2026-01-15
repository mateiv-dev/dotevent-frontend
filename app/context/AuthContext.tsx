"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { apiClient } from "../../lib/apiClient";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, profileData: any) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
  deleteAccount: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase is not configured.");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idTokenResult = await userCredential.user.getIdTokenResult();
    return { ...userCredential, role: idTokenResult.claims.role };
  };

  const signUp = async (email: string, password: string, profileData: any) => {
    if (!auth) throw new Error("Firebase is not configured.");
    await createUserWithEmailAndPassword(auth, email, password);
    await apiClient.post("/api/users/register", profileData);
  };

  const signOut = async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
  };

  const deleteAccount = async () => {
    if (!auth || !auth.currentUser) return;
    const user = auth.currentUser;
    await apiClient.delete("/api/users/me");

    try {
      await user.delete();
    } catch (error: any) {
      if (error?.code !== 'auth/user-token-expired') {
        throw error;
      }
    }

    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};