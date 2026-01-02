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

    const formData = await request.formData()
    const resume_pdf = formData.get("resume_pdf") as File
    const job_description = formData.get("job_description") as string

    console.log("Received request:", {
      has_pdf: !!resume_pdf,
      pdf_name: resume_pdf?.name,
      pdf_size: resume_pdf?.size,
      jd_length: job_description?.length
    })

    if (!resume_pdf) {
      return NextResponse.json(
        { error: "Resume PDF file is required" },
        { status: 400 }
      )
    }

    if (!job_description) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!resume_pdf.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (resume_pdf.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      )
    }

    // Create form data for backend
    const backendFormData = new FormData()
    backendFormData.append("resume_pdf", resume_pdf)
    backendFormData.append("job_description", job_description)

    console.log("Calling backend at:", `${BACKEND_URL}/api/ats-check-pdf`)

    // Call the backend ATS PDF analysis endpoint
    const response = await fetch(`${BACKEND_URL}/api/ats-check-pdf`, {
      method: "POST",
      body: backendFormData,
    })

    console.log("Backend response status:", response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Failed to analyze PDF" }))
      console.error("Backend error:", error)
      return NextResponse.json(
        { error: error.detail || "Failed to analyze ATS compatibility" },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log("Backend result received, score:", result.overall_score)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error("ATS PDF check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}