import { prisma } from "@/lib/prisma";
import type { TodayState } from "@/types";

export type TodayResponse = {
  state: TodayState;
  poem?: { content: string };
  deliveryId?: string;
  hasComment?: boolean;
};

export function utcToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function utcTomorrow(): string {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return tomorrow.toISOString().split("T")[0];
}

export async function getTodayState(userId: string): Promise<TodayResponse> {
  const today = utcToday();

  const [poem, delivery] = await Promise.all([
    prisma.poem.findUnique({
      where: {
        authorId_date: {
          authorId: userId,
          date: today
        }
      },
      select: { id: true }
    }),
    prisma.poemDelivery.findFirst({
      where: {
        recipientId: userId,
        poem: {
          date: today
        }
      },
      select: {
        id: true,
        poem: {
          select: { content: true }
        },
        comment: {
          select: { id: true }
        }
      },
      orderBy: {
        deliveredAt: "desc"
      }
    })
  ]);

  if (!poem) {
    return { state: "write" };
  }

  if (!delivery) {
    return { state: "waiting" };
  }

  if (delivery.comment) {
    return {
      state: "done",
      poem: { content: delivery.poem.content },
      deliveryId: delivery.id,
      hasComment: true
    };
  }

  return {
    state: "read",
    poem: { content: delivery.poem.content },
    deliveryId: delivery.id,
    hasComment: false
  };
}
