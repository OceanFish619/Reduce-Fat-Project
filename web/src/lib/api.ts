const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

type QueryParams = Record<string, string | number | undefined>;

const buildUrl = (path: string, params?: QueryParams) => {
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, `${API_BASE}/`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with ${response.status}`);
  }
  return response.json();
};

const authHeaders = (token?: string): HeadersInit | undefined => {
  if (!token) {
    return undefined;
  }
  return { Authorization: `Bearer ${token}` };
};

export const apiGet = async <T>(
  path: string,
  params?: QueryParams,
  token?: string
) =>
  apiRequest<T>(buildUrl(path, params), {
    method: "GET",
    headers: authHeaders(token),
  });

export const apiPost = async <T>(
  path: string,
  payload: unknown,
  token?: string
) =>
  apiRequest<T>(buildUrl(path), {
    method: "POST",
    body: JSON.stringify(payload),
    headers: authHeaders(token),
  });

export const apiDelete = async <T>(path: string, token?: string) =>
  apiRequest<T>(buildUrl(path), {
    method: "DELETE",
    headers: authHeaders(token),
  });
