"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { getAuthSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
// Added Plus and Upload icons to match the image
import { ArrowLeft, User, Home, Calendar, ClipboardList, Plus, Upload, FileText } from "lucide-react"

interface Resident {
  id: number
  full_name: string
  dob: string
  gender: string
  room_number: string
  medical_notes: string
  created_at: string
}

export default function ResidentDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [resident, setResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResident() {
      try {
        const session = getAuthSession()
        const res = await fetch(`http://127.0.0.1:8000/api/residents/${id}/`, {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        })
        if (!res.ok) throw new Error("Resident not found")
        const data = await res.json()
        setResident(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchResident()
  }, [id])

  if (loading) return <div className="p-10 font-bold text-[#1F2A6D]">Loading profile...</div>
  if (!resident) return <div className="p-10 font-bold text-red-500">Resident not found.</div>

  return (
    <AppLayout>
      <div className="min-h-screen bg-[#EEF1FA] p-10 font-sans">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 text-[#1F2A6D] font-bold hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-white/50">
              <div className="bg-[#27317F] p-8 text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black border-2 border-white/10">
                  {resident.full_name.charAt(0)}
                </div>
                <h2 className="text-white text-2xl font-black">{resident.full_name}</h2>
                <p className="text-indigo-200 font-bold uppercase text-xs tracking-widest mt-1">
                  Resident ID: #{resident.id}
                </p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Home size={20}/></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Room Number</p>
                    <p className="text-[#1F2A6D] font-extrabold">{resident.room_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Calendar size={20}/></div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight">Date of Birth</p>
                    <p className="text-[#1F2A6D] font-extrabold">{resident.dob}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* --- NEW QUICK ACTIONS UI --- */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-white/50">
              <div className="mb-6">
                <h3 className="text-xl font-black text-[#1F2A6D]">Quick Actions</h3>
                <p className="text-gray-400 text-sm font-semibold">Start building a care plan</p>
              </div>

              <div className="flex flex-col gap-0 border rounded-xl overflow-hidden shadow-sm">
                {/* <button className="flex items-center gap-3 px-6 py-4 bg-[#0062AD] text-white hover:bg-[#005291] transition-colors border-b border-white/10">
                  <Plus size={18} strokeWidth={3} />
                  <span className="font-bold">New Patient</span>
                </button> */}

                <Link href={`/assessments/upload?patientId=${resident.id}`}> 
                <button className="flex items-center gap-3 px-6 py-4 bg-white text-[#1F2A6D] hover:bg-gray-50 transition-colors border-b">
                  <Upload size={18} className="text-gray-600" />
                  <span className="font-bold">Upload Assessment</span>
                </button>
                 </Link>

                <Link href={`/assessments/new?patientId=${resident.id}`}>
                <button className="flex items-center gap-3 px-6 py-4 bg-white text-[#1F2A6D] hover:bg-gray-50 transition-colors">
                  <FileText size={18} className="text-gray-600" />
                  <span className="font-bold">Create Assessment Manually</span>
                </button>
                </Link>
              </div>
            </div>
            {/* --- END QUICK ACTIONS UI --- */}

            {/* Medical & Care Notes */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-white/50">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="text-orange-500" />
                <h3 className="text-xl font-black text-[#1F2A6D]">Medical & Care Notes</h3>
              </div>
              <div className="bg-orange-50/50 border-l-4 border-orange-400 p-6 rounded-r-xl">
                <p className="text-gray-700 leading-relaxed font-semibold">
                  {resident.medical_notes || "No specific medical notes recorded for this resident."}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border border-white/50">
              <h3 className="text-xl font-black text-[#1F2A6D] mb-6">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-4 border-l-2 border-gray-100 pl-6 pb-6 relative">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500" />
                  <div>
                    <p className="text-sm font-black text-[#1F2A6D]">Morning Assessment Completed</p>
                    <p className="text-xs text-gray-400 font-bold uppercase">Today • 09:30 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  )
}
















// "use client"
// import { useParams, useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { AppLayout } from "@/components/layout/app-layout"
// import { getAuthSession } from "@/lib/auth"
// import { Button } from "@/components/ui/button"
// import { ArrowLeft, User, Home, Calendar, ClipboardList } from "lucide-react"

// interface Resident {
//   id: number
//   full_name: string
//   dob: string
//   gender: string
//   room_number: string
//   medical_notes: string
//   created_at: string
// }

// export default function ResidentDetailsPage() {
//   const { id } = useParams()
//   const router = useRouter()
//   const [resident, setResident] = useState<Resident | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function fetchResident() {
//       try {
//         const session = getAuthSession()
//         const res = await fetch(`http://127.0.0.1:8000/api/residents/${id}/`, {
//           headers: {
//             Authorization: `Bearer ${session?.token}`,
//           },
//         })
//         if (!res.ok) throw new Error("Resident not found")
//         const data = await res.json()
//         setResident(data)
//       } catch (err) {
//         console.error(err)
//       } finally {
//         setLoading(false)
//       }
//     }
//     if (id) fetchResident()
//   }, [id])

//   if (loading) return <div className="p-10">Loading profile...</div>
//   if (!resident) return <div className="p-10">Resident not found.</div>

//   return (
//     <AppLayout>
//       <div className="min-h-screen bg-[#EEF1FA] p-10">
//         {/* Back Button */}
//         <Button 
//           variant="ghost" 
//           onClick={() => router.back()}
//           className="mb-6 text-[#1F2A6D] font-bold hover:bg-white"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
//         </Button>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Column: Profile Card */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
//               <div className="bg-[#27317F] p-8 text-center">
//                 <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black">
//                   {resident.full_name.charAt(0)}
//                 </div>
//                 <h2 className="text-white text-2xl font-black">{resident.full_name}</h2>
//                 <p className="text-indigo-200 font-bold uppercase text-xs tracking-widest mt-1">
//                   Resident ID: #{resident.id}
//                 </p>
//               </div>
              
//               <div className="p-8 space-y-6">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Home size={20}/></div>
//                   <div>
//                     <p className="text-xs text-gray-400 font-bold uppercase">Room Number</p>
//                     <p className="text-[#1F2A6D] font-extrabold">{resident.room_number}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Calendar size={20}/></div>
//                   <div>
//                     <p className="text-xs text-gray-400 font-bold uppercase">Date of Birth</p>
//                     <p className="text-[#1F2A6D] font-extrabold">{resident.dob}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column: Medical Notes & Activity */}
//           <div className="lg:col-span-2 space-y-8">
//             <div className="bg-white rounded-3xl shadow-xl p-10">
//               <div className="flex items-center gap-3 mb-6">
//                 <ClipboardList className="text-orange-500" />
//                 <h3 className="text-xl font-black text-[#1F2A6D]">Medical & Care Notes</h3>
//               </div>
//               <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-xl">
//                 <p className="text-gray-700 leading-relaxed font-medium">
//                   {resident.medical_notes || "No specific medical notes recorded for this resident."}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white rounded-3xl shadow-xl p-10">
//               <h3 className="text-xl font-black text-[#1F2A6D] mb-6">Recent Activity</h3>
//               <div className="space-y-4">
//                 {/* Mock timeline items */}
//                 <div className="flex gap-4 border-l-2 border-gray-100 pl-6 pb-6 relative">
//                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500" />
//                   <div>
//                     <p className="text-sm font-black text-[#1F2A6D]">Morning Assessment Completed</p>
//                     <p className="text-xs text-gray-400 font-bold uppercase">Today • 09:30 AM</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>
//     </AppLayout>
//   )
// }