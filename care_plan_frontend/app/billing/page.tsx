"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { CreditCard, Download, Calendar } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and payment methods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Professional Plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">$600</span>
                  <Badge>Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Billed monthly • Renews on Feb 10, 2025</p>
                <div className="pt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Package Usage</CardTitle>
              <CardDescription>This billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Care Plan Exports</span>
                    <span className="text-sm text-muted-foreground">53 of 100 used</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "53%" }} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">47 exports remaining</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Add More Exports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2026</p>
                </div>
                <Badge variant="secondary">Default</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="bg-transparent">
                  Remove
                </Button>
              </div>
            </div>
            <Button variant="outline" className="mt-4 bg-transparent">
              <CreditCard className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { date: "2025-01-10", amount: 600, status: "Paid", invoice: "INV-2025-001" },
                { date: "2024-12-10", amount: 600, status: "Paid", invoice: "INV-2024-012" },
                { date: "2024-11-10", amount: 600, status: "Paid", invoice: "INV-2024-011" },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">${payment.amount}</p>
                      <p className="text-sm text-muted-foreground">{payment.date}</p>
                    </div>
                    <Badge variant="outline">{payment.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{payment.invoice}</span>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
