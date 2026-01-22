import { type NextRequest, NextResponse } from "next/server"
import { DEMO_CREDENTIALS } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password, provider } = await request.json()

//     // Handle Google Sign-In (demo implementation)
//     if (provider === "google") {
//       // In production, verify Google token here
//       return NextResponse.json({
//         success: true,
//         session: {
//           user: DEMO_CREDENTIALS["client-admin"].user,
//           token: "demo-google-token-" + Date.now(),
//         },
//       })
//     }

//     // Email/password authentication
//     const demoUser = Object.values(DEMO_CREDENTIALS).find((cred) => cred.email === email && cred.password === password)

//     if (!demoUser) {
//       return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 })
//     }

//     // Create session
//     const session = {
//       user: demoUser.user,
//       token: "demo-token-" + Date.now(),
//     }

//     return NextResponse.json({ success: true, session })
//   } catch (error) {
//     return NextResponse.json({ success: false, error: "Login failed" }, { status: 500 })
//   }
// }




const BACKEND_URL = "http://127.0.0.1:8000/api/token/"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Your UI uses "email", Django expects "username"
    const payload = {
      username: body.email,   // map email → username
      password: body.password,
    }

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: data.detail || "Invalid credentials" },
        { status: 401 }
      )
    }

    /**
     * data = {
     *   access: "...",
     *   refresh: "..."
     * }
     */

    return NextResponse.json({
      success: true,
      session: {
        // tokens: data,
        token: data.access,
        user: parseJwt(data.access),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    )
  }
}

/**
 * Decode JWT payload (no verification, frontend only)
 */
function parseJwt(token: string) {
  const base64Payload = token.split(".")[1]
  const payload = Buffer.from(base64Payload, "base64").toString()
  return JSON.parse(payload)
}

