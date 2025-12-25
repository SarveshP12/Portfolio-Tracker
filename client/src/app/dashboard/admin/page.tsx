import { redirect } from "next/navigation"
import { getCurrentSupabaseUser } from "@/lib/sync-user"
import { AdminSidebar } from "@/components/admin-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminDashboardContent } from "@/components/admin-dashboard-content"

export default async function AdminDashboardPage() {
  const user = await getCurrentSupabaseUser()

  if (!user) {
    redirect("/sign-in")
  }

  if (user.role !== "admin") {
    redirect("/dashboard/student")
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
      <AdminSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <AdminDashboardContent user={user} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
