"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { FadeIn } from "@/components/fade-in";
import { AppChrome } from "@/components/app-chrome";

type TodayPayload = {
  state: "write" | "waiting" | "read" | "done";
};

function utcTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().split("T")[0];
}

export default function DonePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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

      if (payload.state === "waiting" || payload.state === "read") {
        router.replace("/read");
        return;
      }

      setReady(true);
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <AppChrome />
      <FadeIn className="app-shell">
        <section
          style={{
            minHeight: "calc(100dvh - 4rem)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            gap: "0.7rem"
          }}
        >
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)", lineHeight: 1.05 }}>you&apos;re done for today.</h1>
          <p className="ui-label">a poem thrown. a word returned. closure.</p>
          <p className="ui-label">come back tomorrow.</p>
          <p className="ui-label">{utcTomorrow()}</p>
          <Link href="/inbox" className="ui-label minimal-link" style={{ marginTop: "0.6rem" }}>
            read received words →
          </Link>
        </section>
      </FadeIn>
    </>
  );
}
