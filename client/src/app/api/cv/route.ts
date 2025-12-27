import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

// GET - Fetch user's CV data
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch all CV components
    const [
      workExperiencesResult,
      skillsResult,
      certificationsResult,
      awardsResult,
      extraCurricularsResult,
      selectedProjectsResult
    ] = await Promise.all([
      supabaseAdmin.from("work_experiences").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("skills").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("certifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("awards").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("extra_curriculars").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("selected_github_projects").select("*").eq("user_id", user.id)
    ])

    return NextResponse.json({
      workExperiences: workExperiencesResult.data || [],
      skills: skillsResult.data || [],
      certifications: certificationsResult.data || [],
      awards: awardsResult.data || [],
      extraCurriculars: extraCurricularsResult.data || [],
      selectedProjects: selectedProjectsResult.data?.map(p => p.project_id) || []
    })
  } catch (error) {
    console.error("Error fetching CV data:", error)
    return NextResponse.json({ error: "Failed to fetch CV data" }, { status: 500 })
  }
}

// POST - Save CV data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, data } = body

    // Get user from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    switch (type) {
      case "work_experiences": {
        // Delete existing and insert new
        await supabaseAdmin.from("work_experiences").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((item: any) => ({
            user_id: user.id,
            company: item.company,
            position: item.position,
            location: item.location,
            start_date: item.startDate || null,
            end_date: item.endDate || null,
            is_current: item.current,
            description: item.description,
            pdf_url: item.pdfUrl || null
          }))
          
          const { error } = await supabaseAdmin.from("work_experiences").insert(formattedData)
          if (error) throw error
        }
        break
      }

      case "skills": {
        await supabaseAdmin.from("skills").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((item: any) => ({
            user_id: user.id,
            name: item.name,
            level: item.level,
            category: item.category
          }))
          
          const { error } = await supabaseAdmin.from("skills").insert(formattedData)
          if (error) throw error
        }
        break
      }

      case "certifications": {
        await supabaseAdmin.from("certifications").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((item: any) => ({
            user_id: user.id,
            name: item.name,
            issuer: item.issuer,
            issue_date: item.issueDate || null,
            expiry_date: item.expiryDate || null,
            credential_id: item.credentialId,
            credential_url: item.credentialUrl,
            pdf_url: item.pdfUrl || null
          }))
          
          const { error } = await supabaseAdmin.from("certifications").insert(formattedData)
          if (error) throw error
        }
        break
      }

      case "awards": {
        await supabaseAdmin.from("awards").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((item: any) => ({
            user_id: user.id,
            title: item.title,
            issuer: item.issuer,
            date: item.date || null,
            description: item.description,
            pdf_url: item.pdfUrl || null
          }))
          
          const { error } = await supabaseAdmin.from("awards").insert(formattedData)
          if (error) throw error
        }
        break
      }

      case "extra_curriculars": {
        await supabaseAdmin.from("extra_curriculars").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((item: any) => ({
            user_id: user.id,
            activity: item.activity,
            organization: item.organization,
            role: item.role,
            start_date: item.startDate || null,
            end_date: item.endDate || null,
            description: item.description,
            pdf_url: item.pdfUrl || null
          }))
          
          const { error } = await supabaseAdmin.from("extra_curriculars").insert(formattedData)
          if (error) throw error
        }
        break
      }

      case "selected_projects": {
        await supabaseAdmin.from("selected_github_projects").delete().eq("user_id", user.id)
        
        if (data.length > 0) {
          const formattedData = data.map((projectId: number) => ({
            user_id: user.id,
            project_id: projectId
          }))
          
          const { error } = await supabaseAdmin.from("selected_github_projects").insert(formattedData)
          if (error) throw error
        }
        break
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving CV data:", error)
    return NextResponse.json({ error: "Failed to save CV data" }, { status: 500 })
  }
}
