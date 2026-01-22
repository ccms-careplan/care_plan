"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  FileCheck,
  BarChart3,
  FileStack,
  Headphones,
  CreditCard,
  LogOut,
  Building2,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Patients",
    href: "/patients",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Assessments",
    href: "/assessments",
    icon: <ClipboardList className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Care Plans",
    href: "/care-plans",
    icon: <FileText className="h-5 w-5" />,
    roles: ["admin"],
  },
  {
    title: "Review & Export",
    href: "/review-export",
    icon: <FileCheck className="h-5 w-5" />,
    roles: ["client-admin"],
  },
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["super-admin", "master-super-admin"],
  },
  {
    title: "Companies",
    href: "/admin/companies",
    icon: <Building2 className="h-5 w-5" />,
    roles: ["super-admin", "master-super-admin"],
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: <BarChart3 className="h-5 w-5" />,
    roles: ["super-admin", "master-super-admin"],
  },
  {
    title: "Templates",
    href: "/admin/templates",
    icon: <FileStack className="h-5 w-5" />,
    roles: ["super-admin", "master-super-admin"],
  },
  {
    title: "Support Tickets",
    href: "/admin/support",
    icon: <Headphones className="h-5 w-5" />,
    roles: ["super-admin", "master-super-admin"],
  },
  {
    title: "Billing",
    href: "/billing",
    icon: <CreditCard className="h-5 w-5" />,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true
    return user?.role && item.roles.includes(user.role)
  })

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-foreground">CareEase AI</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">{user?.organizationName || "Admin Portal"}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
          <p className="text-xs text-sidebar-foreground/60 mt-1 capitalize">{user?.role?.replace(/-/g, " ")}</p>
        </div>
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground" onClick={logout}>
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Sign out</span>
        </Button>
      </div>
    </aside>
  )
}
