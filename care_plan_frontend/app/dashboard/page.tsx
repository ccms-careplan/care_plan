"use client"
import { getAuthSession } from "@/lib/auth"
import { useEffect, useState } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { getPatientsByOrganization, getCarePlansByPatient } from "@/lib/mock-data"
import { Plus, Upload, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"



interface Resident {
  id: number
  full_name: string
  dob: string
  gender: string
  room_number: string
  medical_notes: string
  created_at: string
}

/* ---------------- HELPERS ---------------- */

const StatusIcon = ({ value }: { value: boolean }) =>
  value ? (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-100 text-green-600 font-black">
      ✓
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-100 text-red-600 font-black">
      ✕
    </span>
  )

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()




export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [totalPatients, setTotalPatients] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const patients = user?.company_id ? getPatientsByOrganization(user.company_id) : []
  const allCarePlans = patients.flatMap((p) => getCarePlansByPatient(p.id))

  const [residents, setResidents] = useState<Resident[]>([])
  const [totalResidents, setTotalResidents] = useState(0)
  

  useEffect(() => {
    async function fetchResidents() {
      try {
        const session = getAuthSession()
        if (!session?.token) throw new Error("Missing auth token")

        const res = await fetch("http://127.0.0.1:8000/api/residents/", {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        if (!res.ok) throw new Error("Unauthorized")

        const data = await res.json()
        setResidents(data.results)
        setTotalResidents(data.count)
      } catch (err) {
        console.error("Failed to fetch residents:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchResidents()
  }, [])

  

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#EEF1FA] font-sans">

  {/* Top Navigation */}
  <header className="bg-gradient-to-r from-[#2E3A8C] to-[#3F51B5] text-white px-8 py-4 flex justify-between items-center shadow-xl">
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
        <span className="text-[#2E3A8C] font-black text-xl">C</span>
      </div>
      <h2 className="font-extrabold text-lg tracking-wide uppercase">
        CCMS Care Plan
      </h2>
    </div>

    <div className="flex items-center space-x-6 text-sm font-semibold">
      <span className="opacity-90">📍 CCMS Support</span>
      <span className="opacity-90">💬 Chat</span>

      <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/20">
        👤 HAUS CCMS
      </div>

      <button className="bg-cyan-400 hover:bg-cyan-500 text-[#1F2A6D] px-5 py-2 rounded-lg text-xs font-black uppercase">
        Switch Company
      </button>
    </div>
  </header>

  <main className="max-w-[1500px] mx-auto p-10">

    {/* Breadcrumb */}
    <div className="flex justify-between items-center mb-10">
      <div className="text-xs font-bold uppercase tracking-widest text-[#6B7280]">
        Dashboard (C-Admin) • <span className="text-[#1F2A6D]">HAUS CCMS</span>
      </div>
    </div>

    {/* Metric Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {[
        { label: 'Total Residents', val: String(totalResidents), icon: '👤', color: 'text-blue-500', bg: 'bg-blue-100' },
        { label: 'Avg. Participation', val: '87.2%', icon: '📈', color: 'text-green-500', bg: 'bg-green-100' },
        { label: 'Activities This Week', val: '42', icon: '📊', color: 'text-purple-500', bg: 'bg-purple-100' },
        { label: 'Days Tracked', val: 'Pending Review', icon: '📅', color: 'text-orange-500', bg: 'bg-orange-100' }
      ].map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-8 rounded-2xl shadow-[0_20px_50px_rgba(31,42,109,0.15)]"
        >
          <div className="flex justify-between mb-4">
            <span className="text-sm font-bold text-gray-500">{card.label}</span>
            <span className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              {card.icon}
            </span>
          </div>
          <p className="text-4xl font-extrabold text-[#1F2A6D]">
            {card.val}
          </p>
        </div>
      ))}
    </div>

    {/* Table Container */}
    <div className="bg-white rounded-3xl shadow-[0_25px_60px_rgba(31,42,109,0.2)] overflow-hidden">

      {/* Table Header */}
      <div className="p-10 border-b">
        <h3 className="text-2xl font-extrabold text-[#1F2A6D]">
          Resident Status Overview
        </h3>
        <p className="text-gray-500 mt-2">
          Reviewing completed assessments and recent actions.
        </p>
      </div>

      {/* Table */}
      <table className="w-full">
              <thead className="bg-[#27317F] text-white text-xs uppercase">
                <tr>
                  <th className="px-8 py-5 text-left">Resident Name</th>
                  <th className="px-6 py-5 text-center">Assessment</th>
                  <th className="px-6 py-5 text-center">Care Plan</th>
                  <th className="px-6 py-5 text-center">Action</th>
                  <th className="px-6 py-5 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm font-semibold">

                {loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-gray-500">
                      Loading residents...
                    </td>
                  </tr>
                )}

                {!loading && residents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-gray-500">
                      No residents found
                    </td>
                  </tr>
                )}

                {!loading &&
                  residents.map((resident) => (
                    <tr key={resident.id} 
                      onClick={() => router.push(`/residents/${resident.id}`)}
                      className="hover:bg-indigo-50 cursor-pointer transition-colors">
                      <td className="px-8 py-6 flex items-center gap-4 text-[#1F2A6D]">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                          {getInitials(resident.full_name)}
                        </div>
                        <div>
                          <div>{resident.full_name}</div>
                          <div className="text-xs text-gray-400">
                            {resident.room_number}
                          </div>
                        </div>
                      </td>

                      <td className="text-center">
                        <StatusIcon value={true} />
                      </td>

                      <td className="text-center">
                        <StatusIcon value={false} />
                      </td>

                      <td className="text-center text-orange-500">Updated</td>
                      <td className="text-center text-blue-500">Approved</td>
                    </tr>
                  ))}
              </tbody>
            </table>
      
      {/* Footer */}

      <div className="px-10 py-6 bg-[#F4F6FD] text-xs font-bold text-gray-500">
              Showing {residents.length} of {totalResidents} Residents
            </div>
      {/* <div className="px-10 py-6 bg-[#F4F6FD] flex justify-between items-center text-xs font-bold text-gray-500">
        Showing 2 of 5 Residents
        <button className="w-9 h-9 rounded-lg bg-[#27317F] text-white">1</button>
      </div> */}
    </div>
  </main>
</div>

    </AppLayout>
  )
}






















// "use client"

// import { useEffect, useState } from "react"
// import Link from "next/link"
// import { AppLayout } from "@/components/layout/app-layout"
// import { Button } from "@/components/ui/button"
// import { getAuthSession } from "@/lib/auth"
// import { Plus, Upload, FileText } from "lucide-react"

// /* ---------------- TYPES ---------------- */

// interface Resident {
//   id: number
//   full_name: string
//   dob: string
//   gender: string
//   room_number: string
//   medical_notes: string
//   created_at: string
// }

// /* ---------------- HELPERS ---------------- */

// const StatusIcon = ({ value }: { value: boolean }) =>
//   value ? (
//     <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-green-100 text-green-600 font-black">
//       ✓
//     </span>
//   ) : (
//     <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-100 text-red-600 font-black">
//       ✕
//     </span>
//   )

// const getInitials = (name: string) =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase()

// /* ---------------- PAGE ---------------- */

// export default function DashboardPage() {
//   const [residents, setResidents] = useState<Resident[]>([])
//   const [totalResidents, setTotalResidents] = useState(0)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function fetchResidents() {
//       try {
//         const session = getAuthSession()
//         if (!session?.token) throw new Error("Missing auth token")

//         const res = await fetch("http://127.0.0.1:8000/api/residents/", {
//           headers: {
//             Authorization: `Bearer ${session.token}`,
//           },
//         })

//         if (!res.ok) throw new Error("Unauthorized")

//         const data = await res.json()
//         setResidents(data.results)
//         setTotalResidents(data.count)
//       } catch (err) {
//         console.error("Failed to fetch residents:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchResidents()
//   }, [])

//   return (
//     <AppLayout>
//       <div className="min-h-screen bg-[#EEF1FA] font-sans">

//         {/* Header */}
//         <header className="bg-gradient-to-r from-[#2E3A8C] to-[#3F51B5] text-white px-8 py-4 flex justify-between items-center shadow-xl">
//           <h2 className="font-extrabold text-lg uppercase">CCMS Activities</h2>
//         </header>

//         <main className="max-w-[1500px] mx-auto p-10">

//           {/* Metric Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
//             <div className="bg-white p-8 rounded-2xl shadow">
//               <span className="text-sm font-bold text-gray-500">Total Residents</span>
//               <p className="text-4xl font-extrabold text-[#1F2A6D] mt-4">
//                 {totalResidents}
//               </p>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-3xl shadow overflow-hidden">

//             <div className="p-10 border-b">
//               <h3 className="text-2xl font-extrabold text-[#1F2A6D]">
//                 Resident Status Overview
//               </h3>
//               <p className="text-gray-500 mt-2">
//                 Reviewing completed assessments and recent actions.
//               </p>
//             </div>

//             <table className="w-full">
//               <thead className="bg-[#27317F] text-white text-xs uppercase">
//                 <tr>
//                   <th className="px-8 py-5 text-left">Resident Name</th>
//                   <th className="px-6 py-5 text-center">Assessment</th>
//                   <th className="px-6 py-5 text-center">Care Plan</th>
//                   <th className="px-6 py-5 text-center">Action</th>
//                   <th className="px-6 py-5 text-center">Status</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y text-sm font-semibold">

//                 {loading && (
//                   <tr>
//                     <td colSpan={5} className="px-8 py-10 text-center text-gray-500">
//                       Loading residents...
//                     </td>
//                   </tr>
//                 )}

//                 {!loading && residents.length === 0 && (
//                   <tr>
//                     <td colSpan={5} className="px-8 py-10 text-center text-gray-500">
//                       No residents found
//                     </td>
//                   </tr>
//                 )}

//                 {!loading &&
//                   residents.map((resident) => (
//                     <tr key={resident.id} className="hover:bg-indigo-50">
//                       <td className="px-8 py-6 flex items-center gap-4 text-[#1F2A6D]">
//                         <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
//                           {getInitials(resident.full_name)}
//                         </div>
//                         <div>
//                           <div>{resident.full_name}</div>
//                           <div className="text-xs text-gray-400">
//                             {resident.room_number}
//                           </div>
//                         </div>
//                       </td>

//                       <td className="text-center">
//                         <StatusIcon value={true} />
//                       </td>

//                       <td className="text-center">
//                         <StatusIcon value={false} />
//                       </td>

//                       <td className="text-center text-orange-500">Updated</td>
//                       <td className="text-center text-blue-500">Approved</td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>

//             <div className="px-10 py-6 bg-[#F4F6FD] text-xs font-bold text-gray-500">
//               Showing {residents.length} of {totalResidents} Residents
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Link href="/patients/new">
//               <Button className="w-full">
//                 <Plus className="mr-2 h-4 w-4" /> New Resident
//               </Button>
//             </Link>

//             <Link href="/assessments/upload">
//               <Button variant="outline" className="w-full">
//                 <Upload className="mr-2 h-4 w-4" /> Upload Assessment
//               </Button>
//             </Link>

//             <Link href="/assessments/new">
//               <Button variant="outline" className="w-full">
//                 <FileText className="mr-2 h-4 w-4" /> Create Assessment
//               </Button>
//             </Link>
//           </div>

//         </main>
//       </div>
//     </AppLayout>
//   )
// } 






















