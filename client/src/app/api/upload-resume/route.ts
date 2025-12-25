import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

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
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Get user data to get the user id
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const fileName = `${userData.id}/${timestamp}_${sanitizedFileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Delete old resume if exists
    const { data: existingStudent } = await supabaseAdmin
      .from("students")
      .select("resume_url")
      .eq("user_id", userData.id)
      .single()

    if (existingStudent?.resume_url) {
      // Extract the path from the URL
      const oldPath = existingStudent.resume_url.split("/resumes/")[1]
      if (oldPath) {
        await supabaseAdmin.storage.from("resumes").remove([oldPath])
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("resumes")
      .upload(fileName, buffer, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("resumes")
      .getPublicUrl(uploadData.path)

    const resumeUrl = urlData.publicUrl

    // Update student record with resume URL
    const { data: existingStudentRecord } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("user_id", userData.id)
      .single()

    if (existingStudentRecord) {
      await supabaseAdmin
        .from("students")
        .update({ 
          resume_url: resumeUrl,
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", userData.id)
    } else {
      await supabaseAdmin
        .from("students")
        .insert({
          user_id: userData.id,
          resume_url: resumeUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    return NextResponse.json({ url: resumeUrl })
  } catch (error) {
    console.error("Error in resume upload:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: "No URL provided" },
        { status: 400 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Extract path from URL and delete from storage
    const pathMatch = url.split("/resumes/")[1]
    if (pathMatch) {
      await supabaseAdmin.storage.from("resumes").remove([pathMatch])
    }

    // Update student record to remove resume URL
    await supabaseAdmin
      .from("students")
      .update({ 
        resume_url: null,
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", userData.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in resume delete:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
