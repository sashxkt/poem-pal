"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { FadeIn } from "@/components/fade-in";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setPending(false);

    if (!result || result.error) {
      setError("invalid email or password");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <FadeIn className="auth-shell">
      <form className="auth-inner" onSubmit={onSubmit}>
        <h1 className="brand">poem pal</h1>
        <p className="ui-label">throw one poem in the wind. get one back. close the day.</p>
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
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="minimal-btn" type="submit" disabled={pending}>
          {pending ? "entering..." : "enter →"}
        </button>
        <p className="ui-label">
          new here? <Link href="/register" className="minimal-link">register</Link>
        </p>
      </form>
    </FadeIn>
  );
}
