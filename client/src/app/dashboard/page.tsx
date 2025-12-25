import { redirect } from "next/navigation"
import { getCurrentSupabaseUser, syncUserToSupabase } from "@/lib/sync-user"

export default async function DashboardPage() {
  // Sync user to Supabase on dashboard load
  await syncUserToSupabase()
  
  // Get the current user's role
  const user = await getCurrentSupabaseUser()
  
  if (!user) {
    redirect("/sign-in")
  }

  // Redirect based on role
  if (user.role === "admin") {
    redirect("/dashboard/admin")
  } else {
    redirect("/dashboard/student")
  }
}
