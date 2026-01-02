import { redirect } from "next/navigation"
import { getCurrentSupabaseUser } from "@/lib/sync-user"
import { StudentSidebar } from "@/components/student-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ATSScoreContent } from "@/components/ats-score-content"

export default async function ATSScorePage() {
  const user = await getCurrentSupabaseUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role === "admin") {
    redirect("/dashboard/admin")
  }

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <ATSScoreContent user={user} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
