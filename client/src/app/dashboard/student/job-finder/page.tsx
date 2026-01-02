import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { StudentSidebar } from "@/components/student-sidebar"
import { JobFinderContent } from "@/components/job-finder-content"
import { supabaseAdmin } from "@/lib/supabase"

async function getUserData(clerkId: string) {
  try {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_id", clerkId)
      .single()

    if (error) {
      console.error("Error fetching user:", error)
      return null
    }

    return user
  } catch (err) {
    console.error("Error:", err)
    return null
  }
}

async function getStudentData(userId: string) {
  try {
    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching student:", error)
      return null
    }

    return student
  } catch (err) {
    console.error("Error:", err)
    return null
  }
}

async function getUserSkills(userId: string) {
  try {
    const { data: skills, error } = await supabaseAdmin
      .from("skills")
      .select("*")
      .eq("user_id", userId)

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching skills:", error)
      return []
    }

    return skills || []
  } catch (err) {
    console.error("Error:", err)
    return []
  }
}

export default async function JobFinderPage() {
  const { userId: clerkUserId } = await auth()
  const clerkUser = await currentUser()

  if (!clerkUserId || !clerkUser) {
    redirect("/sign-in")
  }

  const user = await getUserData(clerkUserId)

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  // Fetch student data and skills for resume matching
  const studentData = await getStudentData(user.id)
  const skillsData = await getUserSkills(user.id)

  // Combine user and student data as profile
  const profile = studentData ? {
    ...user,
    ...studentData,
  } : user

  const userData = {
    id: user.id,
    first_name: user.first_name || clerkUser.firstName,
    last_name: user.last_name || clerkUser.lastName,
    email: user.email,
    avatar_url: user.avatar_url || clerkUser.imageUrl,
    role: user.role,
  }

  return (
    <SidebarProvider>
      <StudentSidebar user={userData} />
      <SidebarInset>
        <SiteHeader />
        <JobFinderContent 
          user={userData} 
          profile={profile}
          skills={skillsData}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
