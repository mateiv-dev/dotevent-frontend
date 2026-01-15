import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public userMessage?: string,
  ) {
    super(message);
    this.name = "APIError";
  }

  getUserFriendlyMessage(): string {
    if (this.userMessage) return this.userMessage;

    switch (this.status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "You need to be logged in to perform this action.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return this.message || "This action conflicts with existing data.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return this.message || "An unexpected error occurred. Please try again.";
    }
  }
}

class APIClient {
  private async getAuthToken(forceRefresh = false): Promise<string> {
    if (!auth?.currentUser) {
      throw new Error("User not authenticated");
    }
    return await auth.currentUser.getIdToken(forceRefresh);
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = await this.getAuthToken();
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      });
    } catch (error) {
      throw new APIError(
        "Network error",
        0,
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }

    if (response.status === 401 && requiresAuth) {
      try {
        const refreshedToken = await this.getAuthToken(true);
        requestHeaders["Authorization"] = `Bearer ${refreshedToken}`;

        response = await fetch(url, {
          ...restOptions,
          headers: requestHeaders,
        });
      } catch (error) {
        throw new APIError(
          "Authentication failed",
          401,
          "Your session has expired. Please log in again."
        );
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const userMessage = errorData.message || undefined;
      throw new APIError(
        errorData.message || `API error: ${response.status}`,
        response.status,
        userMessage,
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    }

    const text = await response.text();
    return text as unknown as T;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async getTotalStatistics(): Promise<TotalStatistics> {
    return this.get<TotalStatistics>("/api/statistics");
  }

  async getRecommendedEvents(
    page?: number,
    limit?: number
  ): Promise<RecommendedEvent[]> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.get<RecommendedEvent[]>(`/api/events/recommendations${query}`);
  }

  async getEventParticipants(eventId: string): Promise<ParticipantsResponse> {
    return this.get<ParticipantsResponse>(`/api/events/${eventId}/participants`);
  }

  async exportParticipantsCSV(eventId: string): Promise<string> {
    const response = await this.get<string>(
      `/api/events/${eventId}/participants/export`
    );
    return response;
  }

  async checkInParticipant(eventId: string, ticketCode: string): Promise<void> {
    return this.post(`/api/events/${eventId}/check-in/${ticketCode}`);
  }

  async getEventStatistics(eventId: string): Promise<EventStatistics> {
    return this.get<EventStatistics>(`/api/events/${eventId}/statistics`);
  }

  async getRejectedEvents(
    page?: number,
    limit?: number
  ): Promise<{ events: RejectedEvent[]; total: number }> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.get(`/api/events/rejected${query}`);
  }

  async getOrganizationEvents(): Promise<OrganizationEvent[]> {
    return this.get<OrganizationEvent[]>("/api/users/me/events/organization");
  }

  async getUserReviews(): Promise<UserReview[]> {
    return this.get<UserReview[]>("/api/users/me/reviews");
  }

  async getAvailableOrganizers(): Promise<AvailableOrganizer[]> {
    return this.get<AvailableOrganizer[]>("/api/users/organizers");
  }
}

export interface MonthlyActivity {
  month: number;
  count: number;
}

export interface TopOrganization {
  name: string;
  events: number;
}

export interface TotalStatistics {
  totalEventsAllTime: number;
  eventsLastMonth: number;
  averageOccupancy: number;
  monthlyActivity: MonthlyActivity[];
  topOrganizations: TopOrganization[];
}

export interface RecommendedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  attendees: number;
  organizer: {
    represents: string | null;
    organizationName: string | null;
  };
  description: string;
  titleImage?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Participant {
  name: string;
  email: string;
  role: string;
  university: string | null;
  represents: string | null;
  organizationName: string | null;
  registeredAt: string | null;
}

export interface ParticipantsResponse {
  eventId: string;
  participants: Participant[];
  total: number;
}

export interface EventStatistics {
  totalParticipants: number;
  checkedInParticipants: number;
  attendanceRate: number;
  feedbackCount: number;
  averageRating: number;
}

export interface RejectedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  attendees: number;
  organizer: {
    represents: string | null;
    organizationName: string | null;
  };
  description: string;
  status: "rejected";
  rejectionReason?: string;
  titleImage?: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  };
}

export interface OrganizationEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  attendees: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  titleImage?: string;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  };
}

export interface UserReview {
  id: string;
  event: {
    id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AvailableOrganizer {
  id: string;
  name: string;
  organizationName?: string;
  represents?: string;
}

export const apiClient = new APIClient();
export { APIError };
