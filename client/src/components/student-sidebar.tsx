"use client"

import * as React from "react"
import {
  IconBook,
  IconBriefcase,
  IconCalendar,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUser,
  IconFileText,
  IconTarget,
  IconSparkles,
  IconClipboardList,
  IconSchool,
  IconBell,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

const studentNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/student",
    icon: IconDashboard,
  },
  {
    title: "My Profile",
    url: "/dashboard/student/profile",
    icon: IconUser,
  },
  {
    title: "CV Builder",
    url: "/dashboard/student/cv-builder",
    icon: IconFileText,
  },
  {
    title: "ATS Score",
    url: "/dashboard/student/ats-score",
    icon: IconTarget,
  },
  {
    title: "Job Matching",
    url: "/dashboard/student/job-matching",
    icon: IconSparkles,
  },
  {
    title: "Job Listings",
    url: "/dashboard/student/jobs",
    icon: IconBriefcase,
  },
  {
    title: "My Applications",
    url: "/dashboard/student/applications",
    icon: IconClipboardList,
  },
  {
    title: "Schedule",
    url: "/dashboard/student/schedule",
    icon: IconCalendar,
  },
  {
    title: "Prep Resources",
    url: "/dashboard/student/resources",
    icon: IconSchool,
  },
  {
    title: "Analytics",
    url: "/dashboard/student/analytics",
    icon: IconChartBar,
  },
]

const navSecondary = [
  {
    title: "Notifications",
    url: "/dashboard/student/notifications",
    icon: IconBell,
  },
  {
    title: "Settings",
    url: "/dashboard/student/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/dashboard/student/help",
    icon: IconHelp,
  },
]

interface StudentSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

export function StudentSidebar({ user, ...props }: StudentSidebarProps) {
  const userData = {
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Student",
    email: user.email,
    avatar: user.avatar_url || "/avatars/default.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard/student">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">JobPred</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={studentNavItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
