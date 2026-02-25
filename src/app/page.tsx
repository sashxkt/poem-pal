import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { getTodayState } from "@/lib/today-state";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const today = await getTodayState(session.user.id);

  if (today.state === "write") {
    redirect("/write");
  }

  if (today.state === "done") {
    redirect("/done");
  }

  redirect("/read");
}
