import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

interface GitHubProject {
  id: number
  name: string
  fullName: string
  description: string | null
  url: string
  primaryLanguage: string | null
  topics: string[]
  stars: number
  forks: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  homepage: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, first_name, last_name, email")
      .eq("clerk_id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get student profile
    const { data: studentData } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("user_id", userData.id)
      .single()

    // Fetch all CV components
    const [
      workExperiencesResult,
      skillsResult,
      certificationsResult,
      awardsResult,
      extraCurricularsResult,
      selectedProjectsResult
    ] = await Promise.all([
      supabaseAdmin.from("work_experiences").select("*").eq("user_id", userData.id),
      supabaseAdmin.from("skills").select("*").eq("user_id", userData.id),
      supabaseAdmin.from("certifications").select("*").eq("user_id", userData.id),
      supabaseAdmin.from("awards").select("*").eq("user_id", userData.id),
      supabaseAdmin.from("extra_curriculars").select("*").eq("user_id", userData.id),
      supabaseAdmin.from("selected_github_projects").select("*").eq("user_id", userData.id)
    ])

    const body = await request.json()
    const { githubProjects = [] } = body as { githubProjects?: GitHubProject[] }

    // Build profile data
    const profile = {
      first_name: userData.first_name || studentData?.first_name || "",
      last_name: userData.last_name || studentData?.last_name || "",
      email: userData.email || "",
      phone: studentData?.phone || "",
      date_of_birth: studentData?.date_of_birth || "",
      gender: studentData?.gender || "",
      address: studentData?.address || "",
      city: studentData?.city || "",
      state: studentData?.state || "",
      pincode: studentData?.pincode || "",
      college_name: studentData?.college_name || "",
      department: studentData?.department || "",
      batch_year: studentData?.batch_year || "",
      roll_number: studentData?.roll_number || "",
      cgpa: studentData?.cgpa || null,
      tenth_percentage: studentData?.tenth_percentage || null,
      twelfth_percentage: studentData?.twelfth_percentage || null,
      backlogs: studentData?.backlogs || null,
      skills: studentData?.skills || [],
      linkedin_url: studentData?.linkedin_url || "",
      github_url: studentData?.github_url || "",
      portfolio_url: studentData?.portfolio_url || "",
    }

    // Format work experiences
    const workExperiences = (workExperiencesResult.data || []).map(exp => ({
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      startDate: exp.start_date || "",
      endDate: exp.end_date || "",
      current: exp.is_current || false,
      description: exp.description || "",
    }))

    // Format skills
    const skills = (skillsResult.data || []).map(skill => ({
      name: skill.name,
      level: skill.level || "Intermediate",
      category: skill.category || "Technical",
    }))

    // Format certifications
    const certifications = (certificationsResult.data || []).map(cert => ({
      name: cert.name,
      issuer: cert.issuer || "",
      issueDate: cert.issue_date || "",
      expiryDate: cert.expiry_date || "",
      credentialId: cert.credential_id || "",
      credentialUrl: cert.credential_url || "",
    }))

    // Format awards
    const awards = (awardsResult.data || []).map(award => ({
      title: award.title,
      issuer: award.issuer || "",
      date: award.date || "",
      description: award.description || "",
    }))

    // Format extra curriculars
    const extraCurriculars = (extraCurricularsResult.data || []).map(activity => ({
      activity: activity.activity,
      organization: activity.organization || "",
      role: activity.role || "",
      startDate: activity.start_date || "",
      endDate: activity.end_date || "",
      description: activity.description || "",
    }))

    // Get selected project IDs from database (for reference)
    const selectedProjectIds = (selectedProjectsResult.data || []).map(p => p.project_id)

    // Use the GitHub projects sent from frontend directly
    // They are already filtered by the user's selection in the UI
    const selectedGithubProjects = githubProjects

    // Call Python backend to generate LaTeX
    const backendResponse = await fetch(`${BACKEND_URL}/api/generate-cv`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile,
        skills,
        workExperiences,
        certifications,
        awards,
        extraCurriculars,
        selectedProjectIds,
        githubProjects: selectedGithubProjects.map(p => ({
          id: p.id,
          name: p.name,
          full_name: p.fullName,
          url: p.url,
          original_description: p.description,
          languages: p.primaryLanguage ? [p.primaryLanguage] : [],
          topics: p.topics || [],
          stars: p.stars,
          primary_language: p.primaryLanguage,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        })),
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      console.error("Backend error:", errorData)
      return NextResponse.json(
        { error: errorData.detail || "Failed to generate CV from backend" },
        { status: backendResponse.status }
      )
    }

    const result = await backendResponse.json()

    return NextResponse.json({
      latexCode: result.latex_code,
      message: result.message,
      analyzedProjects: result.analyzed_projects || [],
    })

  } catch (error) {
    console.error("Error generating CV:", error)
    return NextResponse.json(
      { error: "Failed to generate CV" },
      { status: 500 }
    )
  }
}
