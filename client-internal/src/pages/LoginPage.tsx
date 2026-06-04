import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await login({
        username: String(formData.get("username") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
    } catch {
      setError("Username atau password tidak valid.");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">VC</div>
        <p>VetConnect</p>
        <h1>Staff Portal</h1>
        <span>Manager, Receptionist, & Doctor Access</span>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <div className="input-shell">
            <span className="material-symbols-outlined">person</span>
            <input id="username" name="username" placeholder="Enter username" />
          </div>

          <label htmlFor="password">Password</label>
          <div className="input-shell">
            <span className="material-symbols-outlined">lock</span>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
            />
          </div>

          {error ? <span className="form-error">{error}</span> : null}
          <button type="submit">Sign In</button>
        </form>
      </section>
    </main>
  );
}
