"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, TrendingUp, TrendingDown } from "lucide-react"
import { useState } from "react"

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState("30")

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-2">System-wide metrics and insights</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Total Care Plans Exported</CardDescription>
              <CardTitle className="text-3xl">342</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +18% from previous period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Average Time to Export</CardDescription>
              <CardTitle className="text-3xl">4.2 min</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingDown className="h-4 w-4" />
                -12% faster than goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Active Organizations</CardDescription>
              <CardTitle className="text-3xl">24</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +3 new this month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Organizations by Usage</CardTitle>
              <CardDescription>Most care plans exported</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sunrise Care Home", plans: 48, change: "+12%" },
                  { name: "Maple Grove Assisted Living", plans: 42, change: "+8%" },
                  { name: "Evergreen Senior Care", plans: 38, change: "+15%" },
                  { name: "Harbor View Care Center", plans: 34, change: "+5%" },
                  { name: "Golden Years Community", plans: 29, change: "+22%" },
                ].map((org, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{org.name}</p>
                      <p className="text-xs text-muted-foreground">{org.plans} care plans</p>
                    </div>
                    <span className="text-xs text-green-600">{org.change}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>By subscription tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tier: "Professional", revenue: 7200, count: 12, color: "bg-blue-500" },
                  { tier: "Standard", revenue: 3600, count: 9, color: "bg-green-500" },
                  { tier: "Basic", revenue: 1680, count: 3, color: "bg-yellow-500" },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium text-sm">{item.tier}</span>
                      </div>
                      <span className="text-sm font-semibold">${item.revenue.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">{item.count} organizations</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
