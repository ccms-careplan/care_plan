"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, LogIn, Mail, Ban, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"

interface Company {
  id: string
  name: string
  email: string
  status: "active" | "pending" | "disabled"
  usersCount: number
  createdAt: string
  packageRemaining: number
}

export default function AdminCompaniesPage() {
  const { user } = useAuth()
  const isMasterAdmin = user?.role === "master-super-admin"

  const [searchQuery, setSearchQuery] = useState("")
  const [companies] = useState<Company[]>([
    {
      id: "org-1",
      name: "Demo Care Facility",
      email: "demo@careease.com",
      status: "active",
      usersCount: 12,
      createdAt: "2025-01-10",
      packageRemaining: 47,
    },
    {
      id: "org-2",
      name: "Sunrise Care Home",
      email: "contact@sunrise.com",
      status: "active",
      usersCount: 8,
      createdAt: "2025-01-15",
      packageRemaining: 82,
    },
    {
      id: "org-3",
      name: "Harbor View Care Center",
      email: "contact@harborview.com",
      status: "pending",
      usersCount: 1,
      createdAt: "2025-01-16",
      packageRemaining: 0,
    },
  ])

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLoginAs = (companyId: string) => {
    console.log("Logging in as company:", companyId)
    alert("Login as client admin functionality - would redirect to their dashboard")
  }

  const handleSendEmail = (email: string) => {
    console.log("Sending email to:", email)
    alert(`Email composer would open for: ${email}`)
  }

  const handleToggleStatus = (companyId: string, currentStatus: string) => {
    console.log("Toggling status for:", companyId)
    alert(`Would ${currentStatus === "active" ? "disable" : "enable"} company`)
  }

  const handleDeleteCompany = (companyId: string) => {
    if (!isMasterAdmin) {
      alert("Only Master Super Admins can delete companies")
      return
    }
    if (confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      console.log("Deleting company:", companyId)
      alert("Company deletion would be processed")
    }
  }

  const handleApprove = (companyId: string) => {
    console.log("Approving company:", companyId)
    alert("Company would be approved and notified")
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
          <p className="text-muted-foreground mt-2">Manage client organizations and accounts</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search companies by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{company.name}</h3>
                      <Badge
                        variant={
                          company.status === "active"
                            ? "default"
                            : company.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {company.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Email: {company.email}</p>
                      <p>Users: {company.usersCount}</p>
                      <p>Created: {company.createdAt}</p>
                      {company.status === "active" && <p>Package Remaining: {company.packageRemaining} exports</p>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {company.status === "pending" ? (
                      <Button size="sm" onClick={() => handleApprove(company.id)}>
                        Approve
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleLoginAs(company.id)}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Login As
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendEmail(company.email)}
                          className="bg-transparent"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(company.id, company.status)}
                          className="bg-transparent"
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {company.status === "active" ? "Disable" : "Enable"}
                        </Button>
                        {isMasterAdmin && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Company</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete {company.name}? This will permanently remove all data,
                                  users, and care plans. This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex gap-4 mt-4">
                                <Button variant="destructive" onClick={() => handleDeleteCompany(company.id)}>
                                  Delete Permanently
                                </Button>
                                <Button variant="outline">Cancel</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
