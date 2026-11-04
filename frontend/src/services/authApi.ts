import { setActiveUserEmail } from "./userStorage";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
};

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function readError(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { detail?: string; message?: string };
    return body.detail || body.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Could not verify your session.");
  const user = (await response.json()) as AuthUser;
  setActiveUserEmail(user.email);
  return user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await readError(response, "Invalid email or password."));
  const user = (await response.json()) as AuthUser;
  setActiveUserEmail(user.email);
  return user;
}

export async function register(fullName: string, email: string, password: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fullName, email, password }),
  });
  if (!response.ok) throw new Error(await readError(response, "Could not create your account."));
  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  localStorage.removeItem("activeUserEmail");
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string; message?: string };
    throw new Error(body.detail || body.message || `Could not request a password reset (${response.status}).`);
  }
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(body.detail || "Could not reset your password.");
  }
}
