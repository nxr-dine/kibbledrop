import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("[NextAuth] authorize called with:", credentials)
        if (!credentials?.email || !credentials?.password) {
          console.log("[NextAuth] Missing email or password")
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })
        console.log("[NextAuth] User found:", user)

        if (!user || !user.password) {
          console.log("[NextAuth] No user or no password hash found")
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        console.log("[NextAuth] Password valid:", isPasswordValid)

        if (!isPasswordValid) {
          console.log("[NextAuth] Password is invalid")
          return null
        }

        const returnUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
        console.log("[NextAuth] Returning user:", returnUser)
        return returnUser
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    signUp: "/register"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 