export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  mealCount: number;
};

export type AdminMeal = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

export type AdminUserDetails = Omit<AdminUser, "mealCount"> & {
  bio?: string;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  activityLevel?: string;
  meals: AdminMeal[];
};

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function adminRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Please sign in to continue.");
    if (response.status === 403) throw new Error("You do not have admin access.");
    throw new Error("Could not load admin data.");
  }
  return response.json() as Promise<T>;
}

export function getAdminUsers(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return adminRequest<AdminUser[]>(`/admin/users${query}`);
}

export function getAdminUser(id: number) {
  return adminRequest<AdminUserDetails>(`/admin/users/${id}`);
}

export async function deleteAdminUser(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error("You do not have admin access.");
    throw new Error("Could not delete this user.");
  }
}
