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
import { uploadClient } from "../../lib/uploadClient";

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  eventsLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  events: Event[];
  refreshEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<string>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  createEvent: (newEvent: any, files?: File[]) => Promise<boolean>;

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
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const { user: firebaseUser, loading: authLoading, signOut } = useAuth();

  const fetchUserRegistrations = useCallback(async () => {
    if (!firebaseUser) {
      setRegisteredEventIds(new Set());
      return;
    }

    try {
      const registeredEvents = await apiClient.get<any[]>("/api/users/me/events");
      const eventIds = new Set(registeredEvents.map((event: any) => event._id || event.id));
      setRegisteredEventIds(eventIds);
    } catch (error) {
      console.error("Failed to fetch user registrations:", error);
      setRegisteredEventIds(new Set());
    }
  }, [firebaseUser]);

  const fetchNotifications = useCallback(async () => {
    if (!firebaseUser) {
      setNotifications([]);
      return;
    }

    try {
      const notificationsData = await apiClient.get<any[]>("/api/notifications");
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  }, [firebaseUser]);

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
        isRegistered: registeredEventIds.has(event._id || event.id),
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [registeredEventIds]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserRegistrations();
      fetchNotifications();
    }
  }, [authLoading, fetchUserRegistrations, fetchNotifications]);

  useEffect(() => {
    if (!firebaseUser) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [firebaseUser, fetchNotifications]);

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

          if (firebaseUser.email && firebaseUser.email !== userData.email) {
            try {
              await apiClient.put("/api/users/me/update-email", {});
              const updatedUserData = await apiClient.get<any>("/api/users/me");
              const updatedMappedUser: User = {
                ...updatedUserData,
                id: updatedUserData.firebaseId || updatedUserData._id,
              };
              setCurrentUser(updatedMappedUser);
            } catch (emailSyncError) {
              console.error("Failed to sync email:", emailSyncError);
            }
          }

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
            await signOut();
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

  const registerForEvent = useCallback(async (eventId: string): Promise<string> => {
    try {
      const ticketCode = await apiClient.post<string>(`/api/events/${eventId}/register`, {});

      setRegisteredEventIds((prev) => new Set(prev).add(eventId));

      setEvents((prevEvents) =>
        prevEvents.map((ev) => {
          if (ev.id === eventId) {
            return {
              ...ev,
              isRegistered: true,
              ticketCode: ticketCode,
              attendees: ev.attendees + 1,
            };
          }
          return ev;
        }),
      );

      return ticketCode;
    } catch (error) {
      console.error("Failed to register for event:", error);
      throw error;
    }
  }, []);

  const unregisterFromEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/events/${eventId}/register`);

      setRegisteredEventIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });

      setEvents((prevEvents) =>
        prevEvents.map((ev) => {
          if (ev.id === eventId) {
            return {
              ...ev,
              isRegistered: false,
              ticketCode: undefined,
              attendees: Math.max(0, ev.attendees - 1),
            };
          }
          return ev;
        }),
      );
    } catch (error) {
      console.error("Failed to unregister from event:", error);
      throw error;
    }
  }, []);

  const createEvent = useCallback(
    async (newEvent: any, files: File[] = []): Promise<boolean> => {
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

        if (files.length > 0) {
          await uploadClient.uploadEventWithFiles("/api/events", eventData, files);
        } else {
          await apiClient.post("/api/events", eventData);
        }

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

  const markAsRead = useCallback(async (id: string | number) => {
    try {
      const notificationId = typeof id === 'string' ? id : notifications.find(n => n.id === id)?._id;
      if (!notificationId) return;

      await apiClient.put(`/api/notifications/${notificationId}/read`, {});

      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (id: string | number) => {
    try {
      const notificationId = typeof id === 'string' ? id : notifications.find(n => n.id === id)?._id;
      if (!notificationId) return;

      await apiClient.delete(`/api/notifications/${notificationId}`);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n._id !== notificationId),
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.put("/api/notifications/read-all", {});

      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => ({ ...n, isRead: true })),
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isLoading: authLoading || userLoading,
      eventsLoading,
      updateUser,
      events,
      refreshEvents,
      registerForEvent,
      unregisterFromEvent,
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
      registerForEvent,
      unregisterFromEvent,
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
