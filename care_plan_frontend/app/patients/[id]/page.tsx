"use client"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPatientById, getAssessmentsByPatient, getCarePlansByPatient } from "@/lib/mock-data"
import { ArrowLeft, Plus, Upload, FileText, Calendar, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function PatientDetailPage() {
  const params = useParams()
  const patientId = params?.id as string
  const patient = getPatientById(patientId)
  const assessments = getAssessmentsByPatient(patientId)
  const carePlans = getCarePlansByPatient(patientId)

  if (!patient) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Patient not found</h2>
          <Link href="/patients">
            <Button>Back to Patients</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>DOB: {patient.dateOfBirth}</span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{patient.email}</span>
                </div>
              )}
            </div>
          </div>
          <Link href={`/patients/${patientId}/edit`}>
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="assessments">
              Assessments <span className="ml-2 text-xs">({assessments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="care-plans">
              Care Plans <span className="ml-2 text-xs">({carePlans.length})</span>
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.address && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="mt-1">{patient.address}</p>
                    </div>
                  )}
                  {patient.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="mt-1">{patient.phone}</p>
                    </div>
                  )}
                  {patient.email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="mt-1">{patient.email}</p>
                    </div>
                  )}
                  {patient.preferredLanguage && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                      <p className="mt-1">{patient.preferredLanguage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Care Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.caseManager && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Case Manager</p>
                      <p className="mt-1">{patient.caseManager}</p>
                    </div>
                  )}
                  {patient.physician && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Physician</p>
                      <p className="mt-1">{patient.physician}</p>
                    </div>
                  )}
                  {patient.pharmacy && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pharmacy</p>
                      <p className="mt-1">{patient.pharmacy}</p>
                    </div>
                  )}
                  {patient.preferredHospital && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Preferred Hospital</p>
                      <p className="mt-1">{patient.preferredHospital}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Legal & Directives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.powerOfAttorney && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Power of Attorney</p>
                      <p className="mt-1">{patient.powerOfAttorney}</p>
                    </div>
                  )}
                  {patient.advanceDirectives && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Advance Directives</p>
                      <p className="mt-1">{patient.advanceDirectives}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Create new assessment or care plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/assessments/new?patientId=${patientId}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Assessment
                    </Button>
                  </Link>
                  <Link href={`/assessments/upload?patientId=${patientId}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Assessment
                    </Button>
                  </Link>
                  <Link href={`/care-plans/new?patientId=${patientId}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Care Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assessments</CardTitle>
                    <CardDescription>All assessments for {patient.name}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/assessments/upload?patientId=${patientId}`}>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </Link>
                    <Link href={`/assessments/new?patientId=${patientId}`}>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        New Assessment
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No assessments yet</p>
                    <Link href={`/assessments/new?patientId=${patientId}`}>
                      <Button>Create First Assessment</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessments.map((assessment) => (
                      <Link key={assessment.id} href={`/assessments/${assessment.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer">
                          <div>
                            <p className="font-medium">Assessment - {assessment.assessmentDate}</p>
                            <p className="text-sm text-muted-foreground capitalize">Status: {assessment.status}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care-plans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Care Plans</CardTitle>
                    <CardDescription>All care plans for {patient.name}</CardDescription>
                  </div>
                  <Link href={`/care-plans/new?patientId=${patientId}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Care Plan
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {carePlans.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No care plans yet</p>
                    {assessments.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">Create from existing assessment or start fresh</p>
                        <div className="flex gap-3 justify-center">
                          <Link href={`/care-plans/new?patientId=${patientId}&assessmentId=${assessments[0].id}`}>
                            <Button>Create from Assessment</Button>
                          </Link>
                          <Link href={`/care-plans/new?patientId=${patientId}`}>
                            <Button variant="outline">Create Manually</Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Link href={`/care-plans/new?patientId=${patientId}`}>
                        <Button>Create First Care Plan</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {carePlans.map((plan) => (
                      <Link key={plan.id} href={`/care-plans/${plan.id}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer">
                          <div>
                            <p className="font-medium">Care Plan - {new Date(plan.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground capitalize">Status: {plan.status}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Notes & Comments</CardTitle>
                <CardDescription>Internal notes about this patient</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No notes yet. This feature will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Timeline of all activities for this patient</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No history yet. Activities will appear here as you work.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
