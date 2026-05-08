import { createClient } from "@/lib/supabase/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

export class BackendError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

async function getAccessToken() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") return null;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function authHeaders() {
  const headers = new Headers();
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = await authHeaders();
  const body = init.body;

  if (!(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (init.headers) {
    new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "detail" in payload
        ? String(payload.detail)
        : typeof payload === "object" && payload && "error" in payload
          ? String(payload.error)
          : "Backend request failed.";
    throw new BackendError(message, response.status);
  }

  return payload as T;
}

export async function downloadFromBackend(path: string, filename: string) {
  const headers = await authHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (!response.ok) {
    let message = "Download failed.";
    try {
      const payload = await response.json();
      message = payload.detail || payload.error || message;
    } catch {
      // Keep the generic message if the response is not JSON.
    }
    throw new BackendError(message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

