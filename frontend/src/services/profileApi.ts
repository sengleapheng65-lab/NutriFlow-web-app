import type { UserProfile } from "../pages/Profile";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export async function getProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/profile`, { credentials: "include" });
  if (!response.ok) throw new Error("Could not load your profile.");
  return response.json();
}

export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error("Could not save your profile.");
  return response.json();
}
