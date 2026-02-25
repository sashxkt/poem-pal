import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { matchmaker } from "@/lib/matchmaker";
import { prisma } from "@/lib/prisma";
import { utcToday } from "@/lib/today-state";

const submitSchema = z.object({
  content: z.string().trim().min(1).max(2000)
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = submitSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const today = utcToday();

    const existing = await prisma.poem.findUnique({
      where: {
        authorId_date: {
          authorId: session.user.id,
          date: today
        }
      },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json({ error: "Poem already submitted today" }, { status: 409 });
    }

    await prisma.poem.create({
      data: {
        authorId: session.user.id,
        date: today,
        content: parsed.data.content
      }
    });

    const deliveryId = await matchmaker(session.user.id);

    return NextResponse.json({ success: true, deliveryId });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
