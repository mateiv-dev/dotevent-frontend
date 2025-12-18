import { auth } from "./firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

class UploadClient {
  private async getAuthToken(forceRefresh = false): Promise<string> {
    if (!auth?.currentUser) {
      throw new Error("User not authenticated");
    }
    return await auth.currentUser.getIdToken(forceRefresh);
  }

  async uploadEventWithFiles<T>(
    endpoint: string,
    data: any,
    files: File[] = [],
    requiresAuth = true
  ): Promise<T> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const headers: Record<string, string> = {};

    if (requiresAuth) {
      const token = await this.getAuthToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401 && requiresAuth) {
      const refreshedToken = await this.getAuthToken(true);
      headers["Authorization"] = `Bearer ${refreshedToken}`;

      response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed: ${response.status}`
      );
    }

    return await response.json();
  }

  async updateEventWithFiles<T>(
    endpoint: string,
    data: any,
    files: File[] = [],
    requiresAuth = true
  ): Promise<T> {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    files.forEach((file) => {
      formData.append("files", file);
    });

    const headers: Record<string, string> = {};

    if (requiresAuth) {
      const token = await this.getAuthToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let response = await fetch(url, {
      method: "PUT",
      headers,
      body: formData,
    });

    if (response.status === 401 && requiresAuth) {
      const refreshedToken = await this.getAuthToken(true);
      headers["Authorization"] = `Bearer ${refreshedToken}`;

      response = await fetch(url, {
        method: "PUT",
        headers,
        body: formData,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed: ${response.status}`
      );
    }

    return await response.json();
  }
}

export const uploadClient = new UploadClient();
