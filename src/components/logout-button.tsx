"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    await signOut({ redirect: false });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="logout-btn ui-label"
      disabled={pending}
      aria-label="log out"
    >
      {pending ? "logging out..." : "logout"}
    </button>
  );
}
