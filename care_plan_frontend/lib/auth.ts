// Authentication types and utilities for CareEase AI
export type UserRole = "master-super-admin" | "super-admin" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole    
  company_id?: string
  organizationName?: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
}

// Demo credentials for testing
export const DEMO_CREDENTIALS = {
  "client-admin": {
    email: "demo@careease.com",
    password: "demo123",
    user: {
      id: "demo-c-admin",
      email: "demo@careease.com",
      name: "Demo Client Admin",
      role: "client-admin" as UserRole,
      organizationId: "org-1",
      organizationName: "Demo Care Facility",
      createdAt: new Date().toISOString(),
    },
  },
  "super-admin": {
    email: "admin@careease.com",
    password: "admin123",
    user: {
      id: "demo-sa",
      email: "admin@careease.com",
      name: "Demo Super Admin",
      role: "super-admin" as UserRole,
      createdAt: new Date().toISOString(),
    },
  },
  "master-super-admin": {
    email: "master@careease.com",
    password: "master123",
    user: {
      id: "demo-msa",
      email: "master@careease.com",
      name: "Demo Master Super Admin",
      role: "master-super-admin" as UserRole,
      createdAt: new Date().toISOString(),
    },
  },
}

// Client-side auth helpers
export function setAuthSession(session: AuthSession) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_session", JSON.stringify(session))
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null
  const session = localStorage.getItem("auth_session")
  return session ? JSON.parse(session) : null
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_session")
  }
}

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case "master-super-admin":
    case "super-admin":
      return "/admin/dashboard"
    case "admin":
      return "/dashboard"
    default:
      return "/login"
  }
}
