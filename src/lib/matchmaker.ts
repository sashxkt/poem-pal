import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { utcToday } from "@/lib/today-state";

function pickFairRandom<T extends { _count: { deliveries: number } }>(items: T[]): T | null {
  if (items.length === 0) return null;

  const minDeliveries = Math.min(...items.map((item) => item._count.deliveries));
  const fairest = items.filter((item) => item._count.deliveries === minDeliveries);

  return fairest[Math.floor(Math.random() * fairest.length)] ?? null;
}

async function tryAssignForRecipient(
  tx: Prisma.TransactionClient,
  recipientId: string,
  today: string
): Promise<string | null> {
  const candidates = await tx.poem.findMany({
    where: {
      date: today,
      authorId: { not: recipientId },
      deliveries: {
        none: {
          recipientId
        }
      }
    },
    select: {
      id: true,
      _count: {
        select: {
          deliveries: true
        }
      }
    }
  });

  const remaining = [...candidates];

  while (remaining.length > 0) {
    const chosen = pickFairRandom(remaining);
    if (!chosen) return null;

    try {
      const delivery = await tx.poemDelivery.create({
        data: {
          recipientId,
          poemId: chosen.id
        },
        select: {
          id: true
        }
      });

      return delivery.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const next = remaining.filter((candidate) => candidate.id !== chosen.id);
        remaining.length = 0;
        remaining.push(...next);
        continue;
      }

      throw error;
    }
  }

  return null;
}

async function reverseSweep(tx: Prisma.TransactionClient, today: string): Promise<void> {
  const unmatchedAuthors = await tx.user.findMany({
    where: {
      poems: {
        some: {
          date: today
        }
      },
      deliveries: {
        none: {
          poem: {
            date: today
          }
        }
      }
    },
    select: {
      id: true
    }
  });

  for (const author of unmatchedAuthors) {
    await tryAssignForRecipient(tx, author.id, today);
  }
}

export async function matchmaker(userId: string): Promise<string | null> {
  const today = utcToday();

  return prisma.$transaction(async (tx) => {
    const deliveryId = await tryAssignForRecipient(tx, userId, today);
    await reverseSweep(tx, today);
    return deliveryId;
  });
}
