import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[NextAuth] authorize called with:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.log("[NextAuth] Missing email or password");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        console.log("[NextAuth] User found:", user);

        if (!user || !user.password) {
          console.log("[NextAuth] No user or no password hash found");
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        console.log("[NextAuth] Password valid:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("[NextAuth] Password is invalid");
          return null;
        }

        const returnUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        console.log("[NextAuth] Returning user:", returnUser);
        return returnUser;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};
