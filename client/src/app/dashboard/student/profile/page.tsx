import { redirect } from "next/navigation"
import { getCurrentSupabaseUser, getStudentProfile } from "@/lib/sync-user"
import { StudentSidebar } from "@/components/student-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProfileForm } from "@/components/profile-form"

export default async function StudentProfilePage() {
  const user = await getCurrentSupabaseUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin")
  }

  // Get merged user + student profile data
  const profileData = await getStudentProfile()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <StudentSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information and academic details
              </p>
            </div>
            <ProfileForm user={profileData || user} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
