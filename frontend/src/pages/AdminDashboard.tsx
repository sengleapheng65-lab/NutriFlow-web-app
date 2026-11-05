import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteAdminUser, getAdminUser, getAdminUsers, type AdminUser, type AdminUserDetails } from "../services/adminApi";
import "../styles/AdminDashboard.css";

function formatDate(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers(nextSearch = search) {
    setIsLoading(true);
    setError("");
    try {
      setUsers(await getAdminUsers(nextSearch));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadUsers(""); }, []);

  async function openUser(user: AdminUser) {
    setError("");
    try {
      setSelectedUser(await getAdminUser(user.id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load this user.");
    }
  }

  async function removeUser(user: AdminUser | AdminUserDetails) {
    if (!window.confirm(`Delete ${user.email}? This permanently removes the account and its meals.`)) return;
    try {
      setError("");
      await deleteAdminUser(user.id);
      if (selectedUser?.id === user.id) setSelectedUser(null);
      await loadUsers();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete this user.");
    }
  }

  const totalMeals = useMemo(() => users.reduce((sum, user) => sum + user.mealCount, 0), [users]);

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Administration</p>
          <h1>User management</h1>
          <p className="admin-subtitle">Review accounts and nutrition activity securely.</p>
        </div>
        <Link className="admin-back-link" to="/dashboard">
          <i className="bi bi-arrow-left" aria-hidden="true" />
          <span>Dashboard</span>
        </Link>
      </header>

      <section className="admin-stats" aria-label="User statistics">
        <article><span>Total users</span><strong>{users.length}</strong></article>
        <article><span>Meals in results</span><strong>{totalMeals}</strong></article>
        <article><span>Access</span><strong>Admin only</strong></article>
      </section>

      <section className="admin-card">
        <form className="admin-search" onSubmit={(event) => { event.preventDefault(); void loadUsers(); }}>
          <label htmlFor="admin-user-search">Find a user</label>
          <div>
            <input id="admin-user-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or email" />
            <button type="submit">Search</button>
          </div>
        </form>

        {error && <p className="admin-error" role="alert">{error}</p>}
        {isLoading ? <p className="admin-empty">Loading users…</p> : users.length === 0 ? <p className="admin-empty">No users found.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Email</th><th>Meals</th><th>Actions</th></tr></thead>
              <tbody>{users.map((user) => (
                <tr
                  key={user.id}
                  className={selectedUser?.id === user.id ? "admin-user-row selected" : "admin-user-row"}
                  role="button"
                  tabIndex={0}
                  onClick={() => void openUser(user)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void openUser(user);
                    }
                  }}
                >
                  <td><strong>{user.fullName || "Unnamed user"}</strong><small>ID {user.id}</small></td>
                  <td>{user.email}</td>
                  <td>{user.mealCount}</td>
                  <td><div className="admin-row-actions"><button className="admin-delete-button admin-row-delete-button" type="button" onClick={(event) => { event.stopPropagation(); void removeUser(user); }}>Delete</button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedUser && (
        <section className="admin-card admin-detail-card">
          <div className="admin-detail-heading">
            <div><p className="admin-eyebrow">User details</p><h2>{selectedUser.fullName || "Unnamed user"}</h2><p>{selectedUser.email}</p></div>
            <button className="admin-close-button" type="button" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
          <div className="admin-profile-grid">
            <span>Age<strong>{selectedUser.age || "—"}</strong></span>
            <span>Gender<strong>{selectedUser.gender || "—"}</strong></span>
            <span>Height<strong>{selectedUser.height || "—"}</strong></span>
            <span>Weight<strong>{selectedUser.weight || "—"}</strong></span>
            <span>Activity<strong>{selectedUser.activityLevel || "—"}</strong></span>
          </div>
          <h3>Meal history</h3>
          {selectedUser.meals.length === 0 ? <p className="admin-empty">This user has no saved meals.</p> : (
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Meal</th><th>Calories</th><th>Protein</th><th>Carbs</th><th>Fat</th><th>Date</th></tr></thead>
              <tbody>{selectedUser.meals.map((meal) => <tr key={meal.id}><td>{meal.name}</td><td>{meal.calories}</td><td>{meal.protein}g</td><td>{meal.carbs}g</td><td>{meal.fat}g</td><td>{formatDate(meal.createdAt)}</td></tr>)}</tbody>
            </table></div>
          )}
          <div className="admin-danger-zone">
            <div><strong>Danger zone</strong><p>Deleting this user permanently removes the account and its meals.</p></div>
            <button className="admin-delete-button" type="button" onClick={() => void removeUser(selectedUser)}>Delete user</button>
          </div>
        </section>
      )}
    </main>
  );
}
