"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { StudentSidebar } from "@/components/student-sidebar"
import { SiteHeader } from "@/components/site-header"
import { CVBuilderContent } from "@/components/cv-builder-content"

interface User {
  id: string
  first_name: string | null
  last_name: string | null 
  email: string
  avatar_url: string | null
  role: string
}

export default function CVBuilderPage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUser) return

      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          setDbUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded && isSignedIn) {
      fetchUser()
    } else if (isLoaded && !isSignedIn) {
      setLoading(false)
    }
  }, [isLoaded, isSignedIn, clerkUser])

  if (!isLoaded) {
    return null
  }

  if (!isSignedIn) {
    redirect("/sign-in")
  }

  if (dbUser && dbUser.role !== "student") {
    redirect("/dashboard/admin")
  }

  const userData: User = dbUser || {
    id: clerkUser?.id || "",
    first_name: clerkUser?.firstName || null,
    last_name: clerkUser?.lastName || null,
    email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    avatar_url: clerkUser?.imageUrl || null,
    role: "student",
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
      <StudentSidebar variant="inset" user={userData} />
      <SidebarInset>
        <SiteHeader />
        <CVBuilderContent user={userData} />
      </SidebarInset>
    </SidebarProvider>
  )
}
