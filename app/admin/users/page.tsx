import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase/server";
import { CreateUserForm } from "./CreateUserForm";
import { DeleteUserButton } from "./DeleteUserButton";

export default async function AdminUsersPage() {
  const supabase = getSupabaseAdmin();
  const serverClient = await getSupabaseServer();

  const [{ data: usersData }, { data: { user: currentUser } }] = await Promise.all([
    supabase.auth.admin.listUsers(),
    serverClient.auth.getUser(),
  ]);

  const users = usersData?.users ?? [];

  function formatDate(iso: string | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="admin-shell">
      <div className="admin-header">
        <h1 className="admin-title">User Management</h1>
        <Link href="/chat" className="admin-back">← Back to chat</Link>
      </div>

      <div className="admin-section">
        <p className="admin-section-title">Create account</p>
        <CreateUserForm />
      </div>

      <div className="admin-section">
        <p className="admin-section-title">{users.length} account{users.length !== 1 ? "s" : ""}</p>
        {users.length === 0 ? (
          <p className="admin-empty">No users yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Created</th>
                <th>Last sign-in</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    {u.email}
                    {u.id === currentUser?.id && (
                      <span className="admin-badge" style={{ marginLeft: "0.5rem" }}>you</span>
                    )}
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>{formatDate(u.last_sign_in_at)}</td>
                  <td>
                    {u.id !== currentUser?.id && (
                      <DeleteUserButton userId={u.id} email={u.email ?? u.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
