"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { type User, getAuthSession, setAuthSession, clearAuthSession, getDashboardRoute } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (email: string, password: string, name: string, organizationName?: string) => Promise<void>   
  signupWithGoogle: (name: string, organizationName?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()   

  useEffect(() => {
    // Check for existing session
    const session = getAuthSession()
    if (session) {
      setUser(session.user)
      setToken(session.token)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      setAuthSession(data.session)
      setUser(data.session.user)
      setToken(data.session.token)
      router.push(getDashboardRoute(data.session.user.role))
    } else {
      throw new Error(data.error || "Login failed")
    }
  }

  const loginWithGoogle = async () => {
    // Demo Google login
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google" }),
    })

    const data = await response.json()

    if (data.success) {
      setAuthSession(data.session)
      setUser(data.session.user)
      router.push(getDashboardRoute(data.session.user.role))
    } else {
      throw new Error(data.error || "Google login failed")
    }
  }

  const signup = async (email: string, password: string, name: string, organizationName?: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, organizationName }),
    })

    const data = await response.json()

    if (data.success) {
      setAuthSession(data.session)
      setUser(data.session.user)
      router.push(getDashboardRoute(data.session.user.role))
    } else {
      throw new Error(data.error || "Signup failed")
    }
  }

  const signupWithGoogle = async (name: string, organizationName?: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google", name, organizationName }),
    })

    const data = await response.json()

    if (data.success) {
      setAuthSession(data.session)
      setUser(data.session.user)
      router.push(getDashboardRoute(data.session.user.role))
    } else {
      throw new Error(data.error || "Google signup failed")
    }
  }

  const logout = () => {
    clearAuthSession()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, signup, signupWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
