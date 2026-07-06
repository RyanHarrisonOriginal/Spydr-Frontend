const BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://localhost:3001/api";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

let authTokenGetter: (() => Promise<string | null>) | null = null;
let orgIdGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>): void {
  authTokenGetter = getter;
}

export function setOrgIdGetter(getter: () => string | null): void {
  orgIdGetter = getter;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const { method = "GET", body, ...rest } = options ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };

  if (!headers.Authorization && authTokenGetter) {
    const token = await authTokenGetter();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const orgScoped = !path.startsWith("/organizations");
  if (orgScoped && !headers["X-Org-Id"] && orgIdGetter) {
    const orgId = orgIdGetter();
    if (orgId) {
      headers["X-Org-Id"] = orgId;
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Fetches with a Clerk token at call time (avoids auth getter race on first load). */
export async function apiRequestAuthed<T>(
  getToken: () => Promise<string | null>,
  path: string,
  options?: RequestOptions
): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new Error("Unauthorized");
  }

  return apiRequest<T>(path, {
    ...options,
    headers: {
      ...(options?.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
    },
  });
}
