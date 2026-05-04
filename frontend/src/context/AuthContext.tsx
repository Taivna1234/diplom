"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<User>("/api/auth/me")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const u = await api.post<User>("/api/auth/login", { email, password })
    setUser(u)
  }

  const signup = async (name: string, email: string, password: string) => {
    const u = await api.post<User>("/api/auth/register", { name, email, password })
    setUser(u)
  }

  const logout = async () => {
    await api.post("/api/auth/logout", {}).catch(() => {})
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
