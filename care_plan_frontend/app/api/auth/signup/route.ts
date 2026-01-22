import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@/lib/auth"

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password, name, organizationName, provider } = await request.json()

//     // Validate required fields
//     if (!email || (!password && !provider)) {
//       return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
//     }

//     // Check if user exists (demo - always create new)
//     // In production, check database for existing user

//     // Handle Google Sign-In (demo implementation)
//     if (provider === "google") {
//       const newUser: User = {
//         id: "user-" + Date.now(),
//         email,
//         name: name || email.split("@")[0],
//         role: "admin",
//         organizationId: "org-" + Date.now(),
//         organizationName: organizationName || "New Organization",
//         createdAt: new Date().toISOString(),
//       }

//       const session = {
//         user: newUser,
//         token: "demo-google-signup-token-" + Date.now(),
//       }

//       return NextResponse.json({ success: true, session })
//     }

//     // Create new user (demo)
//     const newUser: User = {
//       id: "user-" + Date.now(),
//       email,
//       name: name || email.split("@")[0],
//       role: "admin",
//       organizationId: "org-" + Date.now(),
//       organizationName: organizationName || "New Organization",
//       createdAt: new Date().toISOString(),
//     }

//     const session = {
//       user: newUser,
//       token: "demo-token-" + Date.now(),
//     }

//     return NextResponse.json({ success: true, session })
//   } catch (error) {
//     return NextResponse.json({ success: false, error: "Signup failed" }, { status: 500 })
//   }
// }


const BACKEND_SIGNUP_URL = "http://127.0.0.1:8000/api/companies/"
const BACKEND_LOGIN_URL = "http://127.0.0.1:8000/api/token/"

export async function POST(req: Request) {
  try {
    const { email, password, name, organizationName } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    /**
     * 1. Create company + admin user
     */
    const signupRes = await fetch(BACKEND_SIGNUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: organizationName || "New Care Organization",
        email,
        phone: "0912345678",          // default (can be changed later)
        address: "Addis Ababa",       // default
        username: name,               // admin username
        password,
      }),
    })

    const signupData = await signupRes.json()

    if (!signupRes.ok) {
      return NextResponse.json(
        { success: false, error: signupData.detail || "Signup failed" },
        { status: 400 }
      )
    }

    /**
     * 2. Auto-login after signup
     */
    const loginRes = await fetch(BACKEND_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: name,
        password,
      }),
    })

    const loginData = await loginRes.json()

    if (!loginRes.ok) {
      return NextResponse.json(
        { success: false, error: "Signup succeeded but login failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        tokens: loginData,
        user: parseJwt(loginData.access),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Signup failed" },
      { status: 500 }
    )
  }
}

/**
 * Decode JWT payload (frontend only)
 */
function parseJwt(token: string) {
  const base64Payload = token.split(".")[1]
  const payload = Buffer.from(base64Payload, "base64").toString()
  return JSON.parse(payload)
}
