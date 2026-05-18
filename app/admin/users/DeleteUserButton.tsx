"use client";

import { useTransition } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete account for ${email}? This cannot be undone.`)) return;
    startTransition(() => deleteUser(userId));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="admin-delete-btn"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
