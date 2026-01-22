"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Building2, Users, DollarSign, FileText, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  const { user } = useAuth()

  const stats = {
    totalCompanies: 24,
    activeUsers: 156,
    monthlyRevenue: 12480,
    exportedPlans: 342,
    pendingApprovals: 3,
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Companies</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                {stats.totalCompanies}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stats.pendingApprovals} pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Users</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                {stats.activeUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Across all organizations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Monthly Revenue</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-600" />${stats.monthlyRevenue.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Exported Plans</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <FileText className="h-8 w-8 text-purple-600" />
                {stats.exportedPlans}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { event: "New company registered", company: "Sunrise Care Home", time: "2 hours ago" },
                  { event: "Payment received", company: "Maple Grove Assisted Living", time: "4 hours ago" },
                  { event: "Support ticket resolved", company: "Evergreen Senior Care", time: "6 hours ago" },
                  { event: "Template updated", company: "System", time: "1 day ago" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.company}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Companies awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.pendingApprovals === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No pending approvals</p>
                ) : (
                  [
                    { name: "Harbor View Care Center", submitted: "2 days ago", email: "contact@harborview.com" },
                    { name: "Peaceful Pines Residence", submitted: "3 days ago", email: "admin@peacefulpines.com" },
                    {
                      name: "Golden Years Community",
                      submitted: "5 days ago",
                      email: "info@goldenyearscommunity.com",
                    },
                  ].map((company, index) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{company.submitted}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                          Approve
                        </button>
                        <button className="text-xs px-3 py-1 border rounded hover:bg-accent">Reject</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
