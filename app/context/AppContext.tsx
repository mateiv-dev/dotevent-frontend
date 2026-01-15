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
import Review from "../types/review";
import { User } from "../types/user";
import { UserSettings, DEFAULT_SETTINGS } from "../types/settings";
import { useAuth } from "./AuthContext";
import { apiClient } from "../../lib/apiClient";
import { uploadClient } from "../../lib/uploadClient";

export interface EventFilters {
  category?: string;
  faculty?: string;
  department?: string;
  location?: string;
  organizer?: string;
  startDate?: string;
  endDate?: string;
}

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  eventsLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  events: Event[];
  refreshEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<string>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  toggleRegistration: (eventId: string) => Promise<void>;
  createEvent: (newEvent: any, files?: File[]) => Promise<boolean>;
  updateEvent: (eventId: string, eventData: any, files?: File[], filesToDelete?: string[]) => Promise<boolean>;
  deleteEvent: (eventId: string) => Promise<boolean>;

  favoritedEventIds: Set<string>;
  toggleFavorite: (eventId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;

  fetchEventReviews: (eventId: string) => Promise<Review[]>;
  addReview: (eventId: string, rating: number, comment?: string) => Promise<void>;
  deleteReview: (reviewId: string, eventId: string) => Promise<void>;

  notifications: Notification[];
  unreadNotificationCount: number;
  markAsRead: (id: string | number) => void;
  deleteNotification: (id: string | number) => void;
  markAllAsRead: () => void;
  sendEventUpdateNotification: (eventId: string) => Promise<void>;

  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;

  filters: EventFilters;
  setFilters: React.Dispatch<React.SetStateAction<EventFilters>>;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: React.Dispatch<React.SetStateAction<boolean>>;

  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [favoritedEventIds, setFavoritedEventIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [filters, setFilters] = useState<EventFilters>({});
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
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
      const registeredEvents = await apiClient.get<any[]>("/api/users/me/registrations");
      const eventIds = new Set(registeredEvents.map((reg: any) => reg.event._id || reg.event.id));
      setRegisteredEventIds(eventIds);
    } catch (error) {
      console.error("Failed to fetch user registrations:", error);
      setRegisteredEventIds(new Set());
    }
  }, [firebaseUser]);

  const fetchFavorites = useCallback(async () => {
    if (!firebaseUser) {
      setFavoritedEventIds(new Set());
      return;
    }

    try {
      const favoritedEvents = await apiClient.get<any[]>("/api/users/me/favorite-events");
      const eventIds = new Set(favoritedEvents.map((event: any) => event._id || event.id));
      setFavoritedEventIds(eventIds);
    } catch (error) {
      console.error("Failed to fetch user favorites:", error);
      setFavoritedEventIds(new Set());
    }
  }, [firebaseUser]);

  const fetchNotifications = useCallback(async () => {
    if (!firebaseUser) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }

    // Don't fetch if user data is loading or if user is admin
    if (!currentUser || currentUser.role === 'admin') {
      return;
    }

    try {
      const notificationsData = await apiClient.get<any[]>("/api/notifications");
      setNotifications(notificationsData);
      // Also fetch unread count
      try {
        const countData = await apiClient.get<{ count: number }>("/api/notifications/unread-count");
        setUnreadNotificationCount(countData.count);
      } catch {
        // Fallback: calculate from notifications
        setUnreadNotificationCount(notificationsData.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    }
  }, [firebaseUser, currentUser]);

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
        isFavorited: favoritedEventIds.has(event._id || event.id),
        faculty: event.faculty,
        department: event.department,
        titleImage: event.titleImage,
        attachments: event.attachments,
        averageRating: event.averageRating || 0,
        reviewCount: event.reviewCount || 0,
        author: event.author,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [registeredEventIds, favoritedEventIds]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, fetchNotifications]);

  useEffect(() => {
    if (
      currentUser &&
      ["simple_user", "student", "student_rep"].includes(currentUser.role)
    ) {
      fetchUserRegistrations();
      fetchFavorites();
    }
  }, [currentUser, fetchUserRegistrations, fetchFavorites]);

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

          // Ensure role field exists - if not, it means we have stale data
          if (!userData.role) {
            console.warn("User data missing role field, clearing cache and refetching");
            if (typeof window !== "undefined") {
              localStorage.removeItem("currentUser");
            }
            // The role should be in the response, so this is an error
            throw new Error("User data is incomplete - missing role field");
          }

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
    if (currentUser && !["simple_user", "student", "student_rep"].includes(currentUser.role)) {
      throw new Error("Only students and regular users can register for events.");
    }
    try {
      const registration = await apiClient.post<any>(`/api/events/${eventId}/register`, {});
      const ticketCode = registration.ticketCode;

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
  }, [currentUser]);

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
        const eventData: any = {
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          category: newEvent.category,
          capacity: newEvent.capacity,
          capacity: newEvent.capacity,
          contact: newEvent.contact,
          description: newEvent.description,
        };

        if (newEvent.faculty) eventData.faculty = newEvent.faculty;
        if (newEvent.department) eventData.department = newEvent.department;

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

  const toggleRegistration = useCallback(async (eventId: string): Promise<void> => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    try {
      if (event.isRegistered) {
        await unregisterFromEvent(eventId);
      } else {
        await registerForEvent(eventId);
      }
    } catch (error) {
      console.error("Failed to toggle registration:", error);
      throw error;
    }
  }, [events, registerForEvent, unregisterFromEvent]);

  const markAsRead = useCallback(async (id: string | number) => {
    try {
      const notificationId = typeof id === 'string' ? id : String(id);
      if (!notificationId) return;

      await apiClient.put(`/api/notifications/${notificationId}/read`, {});

      setNotifications((prevNotifications) =>
        prevNotifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string | number) => {
    try {
      const notificationId = typeof id === 'string' ? id : String(id);
      if (!notificationId) return;

      await apiClient.delete(`/api/notifications/${notificationId}`);

      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.id !== notificationId),
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

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

  const toggleFavorite = useCallback(async (eventId: string): Promise<void> => {
    if (currentUser && !["simple_user", "student", "student_rep"].includes(currentUser.role)) {
      return;
    }
    const isFavorited = favoritedEventIds.has(eventId);

    try {
      if (isFavorited) {
        await apiClient.delete(`/api/events/${eventId}/favorite`);
        setFavoritedEventIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
      } else {
        await apiClient.post(`/api/events/${eventId}/favorite`, {});
        setFavoritedEventIds((prev) => new Set(prev).add(eventId));
      }

      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? { ...ev, isFavorited: !isFavorited } : ev
        )
      );
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      throw error;
    }
  }, [favoritedEventIds, currentUser]);

  const updateEvent = useCallback(
    async (eventId: string, eventData: any, files: File[] = [], filesToDelete: string[] = []): Promise<boolean> => {
      try {
        const payload = {
          ...eventData,
          filesToDelete: filesToDelete.length > 0 ? JSON.stringify(filesToDelete) : undefined,
        };

        if (files.length > 0) {
          await uploadClient.updateEventWithFiles(`/api/events/${eventId}`, payload, files);
        } else {
          await apiClient.put(`/api/events/${eventId}`, { ...eventData, filesToDelete });
        }

        // Send notifications to registered participants about the update
        try {
          await apiClient.post(`/api/notifications/event-updated/${eventId}`, {});
        } catch (notifError) {
          console.warn("Failed to send event update notifications:", notifError);
        }

        await fetchEvents();
        return true;
      } catch (error) {
        console.error("Failed to update event:", error);
        throw error;
      }
    },
    [fetchEvents]
  );

  const deleteEvent = useCallback(async (eventId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/events/${eventId}`);
      setEvents((prevEvents) => prevEvents.filter((ev) => ev.id !== eventId));
      return true;
    } catch (error) {
      console.error("Failed to delete event:", error);
      throw error;
    }
  }, []);

  const fetchEventReviews = useCallback(async (eventId: string): Promise<Review[]> => {
    try {
      const reviews = await apiClient.get<Review[]>(`/api/events/${eventId}/reviews`, {
        requiresAuth: false,
      });
      return reviews;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      return [];
    }
  }, []);

  const addReview = useCallback(async (eventId: string, rating: number, comment?: string): Promise<void> => {
    try {
      await apiClient.post(`/api/events/${eventId}/reviews`, { rating, comment });
      await fetchEvents();
    } catch (error) {
      console.error("Failed to add review:", error);
      throw error;
    }
  }, [fetchEvents]);

  const deleteReview = useCallback(async (reviewId: string, eventId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/reviews/${reviewId}`);
      await fetchEvents();
    } catch (error) {
      console.error("Failed to delete review:", error);
      throw error;
    }
  }, [fetchEvents]);

  const sendEventUpdateNotification = useCallback(async (eventId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/notifications/event-updated/${eventId}`, {});
    } catch (error) {
      console.error("Failed to send event update notification:", error);
      throw error;
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
      toggleRegistration,
      createEvent,
      updateEvent,
      deleteEvent,
      favoritedEventIds,
      toggleFavorite,
      fetchFavorites,
      fetchEventReviews,
      addReview,
      deleteReview,
      notifications,
      unreadNotificationCount,
      markAsRead,
      deleteNotification,
      markAllAsRead,
      sendEventUpdateNotification,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory,
      filters,
      setFilters,
      showFavoritesOnly,
      setShowFavoritesOnly,
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
      toggleRegistration,
      createEvent,
      updateEvent,
      deleteEvent,
      favoritedEventIds,
      toggleFavorite,
      fetchFavorites,
      fetchEventReviews,
      addReview,
      deleteReview,
      notifications,
      unreadNotificationCount,
      markAsRead,
      deleteNotification,
      markAllAsRead,
      sendEventUpdateNotification,
      searchTerm,
      selectedCategory,
      filters,
      showFavoritesOnly,
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