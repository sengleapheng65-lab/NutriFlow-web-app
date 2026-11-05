import type { UserProfile } from "../pages/Profile";

/** Handles authenticated profile reads and writes through the Spring Boot API. */
const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function profileError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as { detail?: string; message?: string; error?: string };
    return new Error(body.detail || body.message || body.error || `Profile request failed (${response.status}).`);
  } catch {
    return new Error(`Profile request failed (${response.status}).`);
  }
}

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/profile`, { credentials: "include" });
  if (!response.ok) throw await profileError(response);
  return response.json();
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw await profileError(response);
  return response.json();
}
