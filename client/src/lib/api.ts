// API configuration for client-server communication
export const API_CONFIG = {
  // Server runs on port 5000, client on port 3000
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // Helper function to build full API URLs
  getApiUrl: (path: string): string => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${API_CONFIG.BASE_URL}/${cleanPath}`;
  }
};

// API request helper with proper server URL
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = API_CONFIG.getApiUrl(url);
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

// Helper for GET requests
export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiRequest('GET', url);
  return res.json();
}

// Helper for POST requests
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('POST', url, data);
  return res.json();
}

// Helper for PUT requests
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiRequest('PUT', url, data);
  return res.json();
}

// Helper for DELETE requests
export async function apiDelete<T>(url: string): Promise<T> {
  const res = await apiRequest('DELETE', url);
  return res.json();
}
