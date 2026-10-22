import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, readJson } from "../lib/api";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const response = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await readJson(response);

      login({
        ...data,
        email: email.trim(),
        name: email.trim().split("@")[0],
      });
    } catch (err) {
      setError(err.message || "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-background auth-background-one" />
      <div className="auth-background auth-background-two" />
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">✦</div>
          <div>
            <h1>Smart Journal</h1>
            <p>Your private space for reflection</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
          <h2>{mode === "login" ? "Continue your journey." : "Create your journal."}</h2>
          <p>{mode === "login" ? "Sign in to discover your thoughts, moods, and patterns." : "Write freely and discover meaningful patterns over time."}</p>
        </div>

        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />
          </label>
          {mode === "register" && (
            <label>
              Confirm password
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" minLength={8} required />
            </label>
          )}
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="auth-switch">
          {mode === "login" ? (
            <>
              Don't have an account?
              <button type="button" onClick={() => { setMode("register"); setError(""); }}>Create one</button>
            </>
          ) : (
            <>
              Already have an account?
              <button type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            </>
          )}
        </div>

        <p className="auth-note">Your journal is accessible only after authentication.</p>
      </section>
    </main>
  );
}
