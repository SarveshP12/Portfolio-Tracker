"use client"

import * as React from "react"
import {
  IconBuilding,
  IconChartBar,
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBriefcase,
  IconCalendar,
  IconReport,
  IconFilter,
  IconUserCheck,
  IconBell,
  IconClipboardList,
  IconCertificate,
  IconSchool,
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

const adminNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: IconDashboard,
  },
  {
    title: "Job Postings",
    url: "/dashboard/admin/jobs",
    icon: IconBriefcase,
  },
  {
    title: "Batch Management",
    url: "/dashboard/admin/batches",
    icon: IconSchool,
  },
  {
    title: "Students",
    url: "/dashboard/admin/students",
    icon: IconUsers,
  },
  {
    title: "Eligibility Filters",
    url: "/dashboard/admin/eligibility",
    icon: IconFilter,
  },
  {
    title: "Applications",
    url: "/dashboard/admin/applications",
    icon: IconClipboardList,
  },
  {
    title: "Schedule",
    url: "/dashboard/admin/schedule",
    icon: IconCalendar,
  },
  {
    title: "Offer Management",
    url: "/dashboard/admin/offers",
    icon: IconCertificate,
  },
  {
    title: "Companies",
    url: "/dashboard/admin/companies",
    icon: IconBuilding,
  },
  {
    title: "Analytics",
    url: "/dashboard/admin/analytics",
    icon: IconChartBar,
  },
  {
    title: "Reports",
    url: "/dashboard/admin/reports",
    icon: IconReport,
  },
  {
    title: "Role Access",
    url: "/dashboard/admin/roles",
    icon: IconUserCheck,
  },
]

const navSecondary = [
  {
    title: "Notifications",
    url: "/dashboard/admin/notifications",
    icon: IconBell,
  },
  {
    title: "Settings",
    url: "/dashboard/admin/settings",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "/dashboard/admin/help",
    icon: IconHelp,
  },
]

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User
}

export function AdminSidebar({ user, ...props }: AdminSidebarProps) {
  const userData = {
    name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Admin",
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
              <a href="/dashboard/admin">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">JobPred Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminNavItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
