"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Clock } from "lucide-react"
import Link from "next/link"

export default function ReviewExportPage() {
  const recentExports = [
    {
      id: "export-1",
      patientName: "Dorothy Martinez",
      carePlanId: "careplan-1",
      exportedAt: "2025-01-17 14:30",
      status: "completed",
    },
    {
      id: "export-2",
      patientName: "Robert Thompson",
      carePlanId: "careplan-2",
      exportedAt: "2025-01-16 10:15",
      status: "completed",
    },
  ]

  const pendingReview = [
    {
      id: "careplan-3",
      patientName: "Margaret Wilson",
      status: "draft",
      lastUpdated: "2025-01-17 16:00",
    },
  ]

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Review & Export</h1>
          <p className="text-muted-foreground mt-2">Review care plans and manage exports</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Care plans waiting for review and export</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReview.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No care plans pending review</p>
              ) : (
                <div className="space-y-3">
                  {pendingReview.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium">{plan.patientName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="secondary">{plan.status}</Badge>
                          <span className="text-xs text-muted-foreground">Updated: {plan.lastUpdated}</span>
                        </div>
                      </div>
                      <Link href={`/care-plans/review?id=${plan.id}`}>
                        <Button size="sm">Review</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Statistics</CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold text-2xl">53</p>
                      <p className="text-sm text-muted-foreground">Care Plans Exported</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-2xl">4.2 min</p>
                      <p className="text-sm text-muted-foreground">Avg. Time to Export</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>Successfully exported care plans</CardDescription>
          </CardHeader>
          <CardContent>
            {recentExports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No exports yet</p>
            ) : (
              <div className="space-y-3">
                {recentExports.map((exportItem) => (
                  <div key={exportItem.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium">{exportItem.patientName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="outline">{exportItem.status}</Badge>
                        <span className="text-xs text-muted-foreground">Exported: {exportItem.exportedAt}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/care-plans/${exportItem.carePlanId}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
