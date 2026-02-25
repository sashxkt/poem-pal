import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const commentSchema = z.object({
  deliveryId: z.string().min(1),
  content: z.string().trim().min(1).max(280)
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const parsed = commentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const delivery = await prisma.poemDelivery.findUnique({
      where: { id: parsed.data.deliveryId },
      select: {
        id: true,
        recipientId: true,
        comment: {
          select: { id: true }
        }
      }
    });

    if (!delivery || delivery.recipientId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (delivery.comment) {
      return NextResponse.json({ error: "Comment already exists" }, { status: 409 });
    }

    await prisma.$transaction([
      prisma.comment.create({
        data: {
          deliveryId: delivery.id,
          content: parsed.data.content
        }
      }),
      prisma.poemDelivery.update({
        where: { id: delivery.id },
        data: {
          hasRead: true
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
