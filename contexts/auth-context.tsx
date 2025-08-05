"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useSession, signIn, signOut, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface AuthContextType {
  isLoggedIn: boolean
  user: any
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    console.log("Attempting login with:", email)
    
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    console.log("SignIn result:", result)

    if (result?.error) {
      throw new Error(result.error)
    }

    // Force session update and wait for it to complete
    console.log("Forcing session update...")
    await update()
    
    // Wait for session to be fully established
    console.log("Waiting for session to establish...")
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Double-check session status
    const currentSession = await getSession()
    console.log("Current session after login:", currentSession)
    
    if (!currentSession) {
      throw new Error("Session not established after login")
    }
    
    console.log("Login completed, session established successfully")
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // Handle session changes
  useEffect(() => {
    console.log("Auth status changed:", status)
    console.log("Session data:", session)
    
    if (status === "authenticated" && session) {
      console.log("User authenticated:", session.user)
    } else if (status === "unauthenticated") {
      console.log("User not authenticated")
    }
  }, [status, session])

  const value = {
    isLoggedIn: !!session,
    user: session?.user,
    login,
    logout,
    isLoading: status === "loading",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
