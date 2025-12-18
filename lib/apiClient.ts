import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

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
      return await response.json();
    }

    return {} as T;
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
}

export const apiClient = new APIClient();
export { APIError };
