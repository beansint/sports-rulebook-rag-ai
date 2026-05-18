"use client";

import { useRef, useState, useTransition } from "react";
import { createUser } from "./actions";

export function CreateUserForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createUser(data);
        formRef.current?.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create user.");
      }
    });
  }

  return (
    <div>
      {error && <div className="login-error" style={{ marginBottom: "1rem" }}>{error}</div>}
      <form ref={formRef} onSubmit={handleSubmit} className="admin-create-form">
        <div className="admin-create-field">
          <label htmlFor="email" className="login-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            className="login-input"
          />
        </div>
        <div className="admin-create-field">
          <label htmlFor="password" className="login-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="min 8 chars"
            className="login-input"
          />
        </div>
        <button type="submit" disabled={isPending} className="login-btn" style={{ marginTop: 0, whiteSpace: "nowrap" }}>
          {isPending ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
