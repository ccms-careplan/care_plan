"use client"

import { useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, X } from "lucide-react"

interface SupportTicket {
  id: string
  company: string
  subject: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
}

export default function AdminSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tickets] = useState<SupportTicket[]>([
    {
      id: "ticket-1",
      company: "Sunrise Care Home",
      subject: "PDF export not working for bathing domain",
      status: "open",
      priority: "high",
      createdAt: "2025-01-16",
      lastUpdate: "2025-01-16",
    },
    {
      id: "ticket-2",
      company: "Maple Grove Assisted Living",
      subject: "Question about stage variations feature",
      status: "in-progress",
      priority: "medium",
      createdAt: "2025-01-15",
      lastUpdate: "2025-01-16",
    },
    {
      id: "ticket-3",
      company: "Evergreen Senior Care",
      subject: "Cannot upload assessment PDF",
      status: "closed",
      priority: "medium",
      createdAt: "2025-01-14",
      lastUpdate: "2025-01-15",
    },
  ])

  const filteredTickets = tickets.filter(
    (t) =>
      t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleClose = (ticketId: string) => {
    console.log("Closing ticket:", ticketId)
    alert("Ticket would be closed and user notified")
  }

  const handleDelete = (ticketId: string) => {
    if (confirm("Are you sure you want to delete this ticket?")) {
      console.log("Deleting ticket:", ticketId)
      alert("Ticket would be deleted")
    }
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Support Tickets</h1>
          <p className="text-muted-foreground mt-2">View and manage client support requests</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search tickets by company or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                      <Badge
                        variant={
                          ticket.status === "closed"
                            ? "outline"
                            : ticket.status === "in-progress"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {ticket.status}
                      </Badge>
                      <Badge
                        variant={
                          ticket.priority === "high"
                            ? "destructive"
                            : ticket.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Company: {ticket.company}</p>
                      <p>Created: {ticket.createdAt}</p>
                      <p>Last Update: {ticket.lastUpdate}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    {ticket.status !== "closed" && (
                      <Button size="sm" onClick={() => handleClose(ticket.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Close
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(ticket.id)}>
                      <X className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
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
