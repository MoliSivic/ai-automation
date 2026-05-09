import { createClient } from "@/lib/supabase/client";

const CONFIGURED_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/backend";

const LOCAL_API_HOSTS = new Set(["localhost", "127.0.0.1"]);

export class BackendError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

export class BackendConnectionError extends BackendError {
  constructor(message: string, cause?: unknown) {
    super(message, 0);
    this.name = "BackendConnectionError";
    if (cause) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export function isBackendConnectionError(
  error: unknown,
): error is BackendConnectionError {
  return error instanceof BackendConnectionError;
}

function getApiBaseUrls() {
  const urls = [CONFIGURED_API_BASE_URL];

  try {
    const configuredUrl = new URL(CONFIGURED_API_BASE_URL);
    if (
      configuredUrl.protocol === "http:" &&
      LOCAL_API_HOSTS.has(configuredUrl.hostname)
    ) {
      const fallbackHost =
        configuredUrl.hostname === "localhost" ? "127.0.0.1" : "localhost";
      configuredUrl.hostname = fallbackHost;
      urls.push(configuredUrl.toString().replace(/\/$/, ""));
    }
  } catch {
    // Keep the configured value only if it is not a valid absolute URL.
  }

  return Array.from(new Set(urls));
}

async function fetchBackend(path: string, init: RequestInit) {
  let lastError: unknown;

  for (const apiBaseUrl of getApiBaseUrls()) {
    try {
      return await fetch(`${apiBaseUrl}${path}`, init);
    } catch (error) {
      lastError = error;
    }
  }

  throw new BackendConnectionError(
    "Backend API is not reachable. Start FastAPI on http://127.0.0.1:8000 or update NEXT_PUBLIC_API_BASE_URL.",
    lastError,
  );
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

  const response = await fetchBackend(path, {
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

  if (
    typeof payload === "object" &&
    payload &&
    "backend_unavailable" in payload
  ) {
    const message =
      "detail" in payload
        ? String(payload.detail)
        : "Backend API is not reachable.";
    throw new BackendConnectionError(message);
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "detail" in payload
        ? String(payload.detail)
        : typeof payload === "object" && payload && "error" in payload
          ? String(payload.error)
          : "Backend request failed.";

    if (
      response.status === 503 &&
      message.startsWith("Backend API is not reachable")
    ) {
      throw new BackendConnectionError(message);
    }

    throw new BackendError(message, response.status);
  }

  return payload as T;
}

export async function downloadFromBackend(path: string, filename: string) {
  const headers = await authHeaders();
  const response = await fetchBackend(path, { headers });

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
