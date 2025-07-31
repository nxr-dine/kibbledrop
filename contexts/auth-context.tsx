"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Simulate login state

  const login = () => {
    setIsLoggedIn(true)
    console.log("User logged in (simulated)")
  }

  const logout = () => {
    setIsLoggedIn(false)
    console.log("User logged out (simulated)")
  }

  return <AuthContext.Provider value={{ isLoggedIn, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
