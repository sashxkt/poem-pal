"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { FadeIn } from "@/components/fade-in";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Could not register" }));
      setError(String(body.error || "Could not register"));
      setPending(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setPending(false);

    if (!signInResult || signInResult.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <FadeIn className="auth-shell">
      <form className="auth-inner" onSubmit={onSubmit}>
        <h1 className="brand">poem pal</h1>
        <p className="ui-label">a daily exchange for closure, not conversation.</p>
        <div className="input-group">
          <input
            className="text-input"
            placeholder="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="text-input"
            placeholder="password (8+ chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="minimal-btn" type="submit" disabled={pending}>
          {pending ? "creating..." : "begin →"}
        </button>
        <p className="ui-label">
          have an account? <Link href="/login" className="minimal-link">login</Link>
        </p>
      </form>
    </FadeIn>
  );
}
