import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      delivery: {
        poem: {
          authorId: session.user.id
        }
      }
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      delivery: {
        select: {
          poem: {
            select: {
              date: true,
              content: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({
    comments: comments.map((item) => ({
      id: item.id,
      content: item.content,
      createdAt: item.createdAt,
      poemDate: item.delivery.poem.date,
      poemPreview: item.delivery.poem.content.slice(0, 160)
    }))
  });
}
