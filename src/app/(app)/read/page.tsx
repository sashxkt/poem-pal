"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { FadeIn } from "@/components/fade-in";
import { AppChrome } from "@/components/app-chrome";

type TodayPayload = {
  state: "write" | "waiting" | "read" | "done";
  poem?: {
    content: string;
  };
  deliveryId?: string;
  hasComment?: boolean;
};

const MAX_COMMENT = 280;

export default function ReadPage() {
  const router = useRouter();
  const [data, setData] = useState<TodayPayload | null>(null);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const response = await fetch("/api/poems/today", { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const payload = (await response.json()) as TodayPayload;
      if (!mounted) return;

      if (payload.state === "write") {
        router.replace("/write");
        return;
      }

      setData(payload);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [router]);

  const commentCount = useMemo(() => comment.length, [comment.length]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data?.deliveryId) return;

    setError("");

    if (!comment.trim()) {
      setError("leave a word first");
      return;
    }

    setPending(true);

    const response = await fetch("/api/poems/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deliveryId: data.deliveryId,
        content: comment
      })
    });

    setPending(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Could not send comment" }));
      setError(String(body.error || "Could not send comment"));
      return;
    }

    router.push("/done");
    router.refresh();
  }

  if (!data) return null;

  return (
    <>
      <AppChrome />
      <FadeIn className="app-shell">
        <section
          style={{
            minHeight: "calc(100dvh - 4rem)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxWidth: "760px",
            margin: "0 auto"
          }}
        >
          <p className="ui-label">a poem for you</p>
          <p className="ui-label">read it. leave a word. let it close.</p>

          {data.state === "waiting" ? (
            <div style={{ marginTop: "18vh", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>still listening...</h1>
              <p className="ui-label">your poem is already in the wind. one arrives when it arrives.</p>
            </div>
          ) : (
            <>
              <article className="poem-text">{data.poem?.content}</article>
              <div className="divider" />

              {data.hasComment ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                  <p className="ui-label">your word has been sent.</p>
                  <Link href="/inbox" className="ui-label minimal-link" style={{ width: "fit-content" }}>
                    received words →
                  </Link>
                </div>
              ) : (
                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                  <textarea
                    className="text-area"
                    placeholder="leave a word..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
                    rows={4}
                    maxLength={MAX_COMMENT}
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      fontSize: "0.9rem",
                      lineHeight: 1.6
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                    <p className="ui-label">
                      {commentCount}/{MAX_COMMENT}
                    </p>
                    <button className="minimal-btn" type="submit" disabled={pending}>
                      {pending ? "sending..." : "send & close →"}
                    </button>
                  </div>
                  {error ? <p className="error">{error}</p> : null}
                </form>
              )}
            </>
          )}
        </section>
      </FadeIn>
    </>
  );
}
