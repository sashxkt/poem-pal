import NextAuth from "next-auth";
import type { NextRequest } from "next/server";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: unknown) {
  return NextAuth(authOptions)(req, context);
}

export async function POST(req: NextRequest, context: unknown) {
  return NextAuth(authOptions)(req, context);
}
