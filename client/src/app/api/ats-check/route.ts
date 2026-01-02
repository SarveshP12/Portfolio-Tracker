import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { resume_text, job_description } = body

    if (!resume_text || !job_description) {
      return NextResponse.json(
        { error: "Both resume_text and job_description are required" },
        { status: 400 }
      )
    }

    // Call the backend ATS analysis endpoint
    const response = await fetch(`${BACKEND_URL}/api/ats-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resume_text,
        job_description,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.detail || "Failed to analyze ATS compatibility" },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error("ATS check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
