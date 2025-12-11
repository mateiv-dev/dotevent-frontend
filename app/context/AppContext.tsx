"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import Event from "../types/event";
import Notification from "../types/notification";
import { User } from "../types/user";
import { UserSettings, DEFAULT_SETTINGS } from "../types/settings";
import { INITIAL_NOTIFICATIONS } from "../data/mockData";
import { useAuth } from "./AuthContext";
import { apiClient } from "../../lib/apiClient";

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  eventsLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  events: Event[];
  refreshEvents: () => Promise<void>;
  toggleRegistration: (id: string) => void;
  createEvent: (newEvent: any) => Promise<boolean>;

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
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const { user: firebaseUser, loading: authLoading } = useAuth();

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const eventsData = await apiClient.get<any[]>("/api/events", {
        requiresAuth: false,
      });
      const mappedEvents: Event[] = eventsData.map((event: any) => ({
        id: event._id || event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        category: event.category,
        attendees: event.attendees || 0,
        capacity: event.capacity,
        organizer: event.organizer,
        description: event.description,
        status: event.status,
        rejectionReason: event.rejectionReason,
        isRegistered: false, // TODO: Implement registration tracking when backend supports it
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (authLoading) return;

    const fetchUser = async (retries = 3, delay = 1000) => {
      if (firebaseUser) {
        setUserLoading(true);
        try {
          const userData = await apiClient.get<any>("/api/users/me");
          const mappedUser: User = {
            ...userData,
            id: userData.firebaseId || userData._id,
          };
          setCurrentUser(mappedUser);
          setUserLoading(false);
        } catch (error: any) {
          const is404 =
            error.status === 404 ||
            error.message?.includes("404") ||
            error.message?.includes("not found");

          if (is404 && retries > 0) {
            setTimeout(() => fetchUser(retries - 1, delay), delay);
            return;
          } else {
            setCurrentUser(null);
            setUserLoading(false);
          }
        }
      } else {
        setCurrentUser(null);
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [firebaseUser, authLoading]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;

      try {
        const updatedUserData = await apiClient.put<any>(
          "/api/users/me",
          updates,
        );

        const mappedUser: User = {
          ...updatedUserData,
          id: updatedUserData.firebaseId || updatedUserData._id,
        };
        setCurrentUser(mappedUser);

        if (typeof window !== "undefined") {
          localStorage.setItem("currentUser", JSON.stringify(mappedUser));
        }
      } catch (error) {
        console.error("Failed to update user profile:", error);
        throw error;
      }
    },
    [currentUser],
  );

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => {
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
      if (typeof window !== "undefined") {
        localStorage.setItem("userSettings", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const toggleRegistration = useCallback((id: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) => {
        if (ev.id === id) {
          return {
            ...ev,
            isRegistered: !ev.isRegistered,
            attendees: ev.isRegistered ? ev.attendees - 1 : ev.attendees + 1,
          };
        }
        return ev;
      }),
    );
  }, []);

  const createEvent = useCallback(
    async (newEvent: any): Promise<boolean> => {
      try {
        const eventData = {
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          category: newEvent.category,
          capacity: newEvent.capacity,
          organizer: newEvent.organizer,
          description: newEvent.description,
        };

        await apiClient.post("/api/events", eventData);

        await fetchEvents();

        return true;
      } catch (error) {
        console.error("Failed to create event:", error);
        return false;
      }
    },
    [fetchEvents],
  );

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  const markAsRead = useCallback((id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== id),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((n) => ({ ...n, isRead: true })),
    );
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading: authLoading || userLoading,
      eventsLoading,
      updateUser,
      events,
      refreshEvents,
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
    }),
    [
      currentUser,
      updateUser,
      events,
      eventsLoading,
      refreshEvents,
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
      userLoading,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
