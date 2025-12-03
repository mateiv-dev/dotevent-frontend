import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class APIError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private async getAuthToken(forceRefresh = false): Promise<string> {
    if (!auth?.currentUser) {
      throw new Error('User not authenticated');
    }
    return await auth.currentUser.getIdToken(forceRefresh);
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restOptions } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = await this.getAuthToken();
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let response = await fetch(url, {
      ...restOptions,
      headers: requestHeaders,
    });

    if (response.status === 401 && requiresAuth) {
      const refreshedToken = await this.getAuthToken(true);
      requestHeaders['Authorization'] = `Bearer ${refreshedToken}`;

      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(errorData.message || `API error: ${response.status}`, response.status);
    }

    return await response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new APIClient();
