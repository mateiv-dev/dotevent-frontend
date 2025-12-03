'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import Event from '../types/event';
import Notification from '../types/notification';
import { User } from '../types/user';
import { UserSettings, DEFAULT_SETTINGS } from '../types/settings';
import { INITIAL_EVENTS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { useAuth } from './AuthContext';
import { apiClient } from '../../lib/apiClient';

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
  events: Event[];
  toggleRegistration: (id: number) => void;
  createEvent: (newEvent: any) => void;

  notifications: Notification[];
  markAsRead: (id: number) => void;
  deleteNotification: (id: number) => void;
  markAllAsRead: () => void;

  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;

  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const { user: firebaseUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const fetchUser = async (retries = 3, delay = 1000) => {
      if (firebaseUser) {
        try {
          const userData = await apiClient.get<any>('/api/users/me');
          const mappedUser: User = {
            ...userData,
            id: userData.firebaseUid
          };
          setCurrentUser(mappedUser);
        } catch (error: any) {
          const is404 = error.status === 404 || error.message?.includes('404') || error.message?.includes('not found');

          if (is404 && retries > 0) {
            console.log(`User profile not found, retrying in ${delay}ms... (${retries} retries left)`);
            setTimeout(() => fetchUser(retries - 1, delay), delay);
          } else {
            console.error('Failed to fetch user profile:', error);
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, [firebaseUser, authLoading]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates } as User;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = {
        ...prev,
        ...updates,
        notifications: updates.notifications
          ? { ...prev.notifications, ...updates.notifications }
          : prev.notifications,
        appearance: updates.appearance
          ? { ...prev.appearance, ...updates.appearance }
          : prev.appearance,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userSettings', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const toggleRegistration = useCallback((id: number) => {
    setEvents(prevEvents => prevEvents.map(ev => {
      if (ev.id === id) {
        return {
          ...ev,
          isRegistered: !ev.isRegistered,
          attendees: ev.isRegistered ? ev.attendees - 1 : ev.attendees + 1
        };
      }
      return ev;
    }));
  }, []);

  const createEvent = useCallback((newEvent: any) => {
    setEvents(prevEvents => {
      const eventToAdd: Event = {
        id: prevEvents.length + 1,
        ...newEvent,
        attendees: 0,
        isRegistered: false,
        organizer: "Student Union"
      };
      return [eventToAdd, ...prevEvents];
    });
  }, []);

  const markAsRead = useCallback((id: number) => {
    setNotifications(prevNotifications => prevNotifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications => prevNotifications.map(n => ({ ...n, isRead: true })));
  }, []);

  const value = useMemo(() => ({
    currentUser,
    isLoading: authLoading,
    updateUser,
    events,
    toggleRegistration,
    createEvent,
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    settings,
    updateSettings,
  }), [
    currentUser,
    updateUser,
    events,
    toggleRegistration,
    createEvent,
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    searchTerm,
    selectedCategory,
    settings,
    updateSettings,
    authLoading,
  ]); return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}