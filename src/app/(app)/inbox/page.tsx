"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FadeIn } from "@/components/fade-in";
import { AppChrome } from "@/components/app-chrome";

type InboxComment = {
  id: string;
  content: string;
  createdAt: string;
  poemDate: string;
  poemPreview: string;
};

type InboxPayload = {
  comments: InboxComment[];
};

export default function InboxPage() {
  const router = useRouter();
  const [comments, setComments] = useState<InboxComment[] | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const response = await fetch("/api/poems/inbox", { cache: "no-store" });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        if (mounted) setComments([]);
        return;
      }

      const payload = (await response.json()) as InboxPayload;
      if (!mounted) return;

      setComments(payload.comments);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (comments === null) return null;

  return (
    <>
      <AppChrome />
      <FadeIn className="app-shell">
        <section style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", lineHeight: 1.05 }}>received words</h1>
            <Link href="/done" className="ui-label minimal-link">
              back
            </Link>
          </div>
          <p className="ui-label">read, keep what you need, and let the rest go.</p>

          {comments.length === 0 ? (
            <p className="ui-label" style={{ marginTop: "0.6rem" }}>
              no words yet.
            </p>
          ) : (
            comments.map((item) => (
              <article
                key={item.id}
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.9rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem"
                }}
              >
                <p className="ui-label">on your poem from {item.poemDate}</p>
                <p style={{ whiteSpace: "pre-wrap", fontSize: "1.12rem", lineHeight: 1.6 }}>{item.content}</p>
                <p className="ui-label">your line: {item.poemPreview}</p>
              </article>
            ))
          )}
        </section>
      </FadeIn>
    </>
  );
}
