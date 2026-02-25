"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { FadeIn } from "@/components/fade-in";
import { AppChrome } from "@/components/app-chrome";

type TodayPayload = {
  state: "write" | "waiting" | "read" | "done";
};

const MAX_CHARS = 2000;

function utcToday() {
  return new Date().toISOString().split("T")[0];
}

export default function WritePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const response = await fetch("/api/poems/today", { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const data = (await response.json()) as TodayPayload;

      if (!mounted) return;

      if (data.state === "read" || data.state === "waiting") {
        router.replace("/read");
        return;
      }

      if (data.state === "done") {
        router.replace("/done");
        return;
      }

      setBooting(false);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [router]);

  const count = useMemo(() => content.length, [content.length]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("write a few words first");
      return;
    }

    setPending(true);

    const response = await fetch("/api/poems/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });

    setPending(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Could not send poem" }));
      setError(String(body.error || "Could not send poem"));
      return;
    }

    router.push("/read");
    router.refresh();
  }

  if (booting) return null;

  return (
    <>
      <AppChrome />
      <FadeIn className="app-shell">
        <form
          onSubmit={onSubmit}
          style={{ minHeight: "calc(100dvh - 4rem)", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <p className="ui-label">today / {utcToday()}</p>
          <p className="ui-label">throw your poem in the wind. no names, no threads.</p>
          <textarea
            className="text-area"
            placeholder="write your poem..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            style={{
              flex: 1,
              fontSize: "clamp(1.4rem, 3.4vw, 1.7rem)",
              lineHeight: 1.7,
              fontFamily: "var(--font-cormorant), serif"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <p className="ui-label">
              {count}/{MAX_CHARS}
            </p>
            <button className="minimal-btn" type="submit" disabled={pending}>
              {pending ? "sending..." : "send it →"}
            </button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </form>
      </FadeIn>
    </>
  );
}
