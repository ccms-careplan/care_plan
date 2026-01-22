// import { NextResponse } from "next/server"
// import { cookies } from "next/headers"


// const BACKEND_URL = "http://127.0.0.1:8000/api/residents/"

// export async function GET() {

// //   const { user } = useAuth()  
// //   try {
// //     const session = getAuthSession()
// //     console.log(session)


//     // if (!session?.token) return

//     const cookieStore = await cookies()
//     // const sessionCookie = cookieStore.get("auth_session")?.name

//     // if (!sessionCookie) {
//     //   return NextResponse.json(
//     //     { error: "Unauthorized" },
//     //     { status: 401 }
//     //   )
//     // }

//     // const session = JSON.parse(sessionCookie)

//     // const res = await fetch(BACKEND_URL, {
//     //   headers: {
//     //     Authorization: `Bearer ${session?.token}`,
//     //   },
//     // })

//     const data = await res.json()

//     if (!res.ok) {
//       return NextResponse.json(
//         { error: "Failed to fetch residents" },
//         { status: res.status }
//       )
//     }

//     return NextResponse.json(data)
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json(
//       { error: "Server error" },
//       { status: 500 }
//     )
//   }
// }
