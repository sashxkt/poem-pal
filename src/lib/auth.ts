import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authSecret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() }
        });

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
