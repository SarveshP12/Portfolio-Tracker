"use client"

import { useState, useEffect } from "react"
import {
  IconBriefcase,
  IconBuilding,
  IconCalendarEvent,
  IconFileDescription,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCheck,
  IconClock,
  IconEye,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface AdminDashboardContentProps {
  user: User
}

// Mock data for the admin dashboard
const recentStudents = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    department: "Computer Science",
    applications: 12,
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: null,
    department: "Information Technology",
    applications: 8,
    status: "active",
  },
  {
    id: 3,
    name: "Bob Wilson",
    email: "bob@example.com",
    avatar: null,
    department: "Data Science",
    applications: 15,
    status: "placed",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice@example.com",
    avatar: null,
    department: "Computer Science",
    applications: 6,
    status: "active",
  },
]

const activeJobs = [
  {
    id: 1,
    company: "Google",
    position: "Software Engineer",
    openings: 5,
    applications: 45,
    deadline: "Jan 5, 2026",
    status: "active",
  },
  {
    id: 2,
    company: "Microsoft",
    position: "Product Manager",
    openings: 3,
    applications: 28,
    deadline: "Jan 10, 2026",
    status: "active",
  },
  {
    id: 3,
    company: "Amazon",
    position: "Data Analyst",
    openings: 8,
    applications: 62,
    deadline: "Jan 3, 2026",
    status: "closing",
  },
  {
    id: 4,
    company: "Meta",
    position: "ML Engineer",
    openings: 2,
    applications: 34,
    deadline: "Jan 15, 2026",
    status: "active",
  },
]

const upcomingDrives = [
  {
    id: 1,
    company: "Stripe",
    date: "Dec 28, 2025",
    time: "9:00 AM",
    type: "On-Campus",
    registrations: 85,
  },
  {
    id: 2,
    company: "Airbnb",
    date: "Jan 2, 2026",
    time: "10:00 AM",
    type: "Virtual",
    registrations: 120,
  },
  {
    id: 3,
    company: "Uber",
    date: "Jan 5, 2026",
    time: "2:00 PM",
    type: "On-Campus",
    registrations: 95,
  },
]

const placementStats = {
  totalStudents: 450,
  placedStudents: 180,
  averagePackage: "$95,000",
  highestPackage: "$180,000",
  companiesVisited: 35,
  offersRolled: 210,
}

export function AdminDashboardContent({ user }: AdminDashboardContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing skeleton until mounted
  if (!mounted) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Admin Dashboard 🎯
        </h1>
        <p className="text-muted-foreground">
          Manage placements, track student progress, and oversee recruitment activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <IconUsers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <IconTrendingUp className="mr-1 size-3" />+25 this month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placed Students</CardTitle>
            <IconCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.placedStudents}</div>
            <Progress value={(placementStats.placedStudents / placementStats.totalStudents) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {((placementStats.placedStudents / placementStats.totalStudents) * 100).toFixed(1)}% placement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Companies Visited</CardTitle>
            <IconBuilding className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.companiesVisited}</div>
            <p className="text-xs text-muted-foreground">
              {placementStats.offersRolled} offers rolled out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Package</CardTitle>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{placementStats.averagePackage}</div>
            <p className="text-xs text-muted-foreground">
              Highest: {placementStats.highestPackage}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="jobs">Active Jobs</TabsTrigger>
          <TabsTrigger value="drives">Drives</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Overview of recently active students</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={student.avatar || undefined} />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.applications}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "placed" ? "default" : "secondary"}>
                          {student.status === "placed" ? (
                            <><IconCheck className="mr-1 size-3" />Placed</>
                          ) : (
                            <><IconClock className="mr-1 size-3" />Active</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <IconEye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Students</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Job Postings</CardTitle>
                <CardDescription>Current job openings for students</CardDescription>
              </div>
              <Button>Add New Job</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{job.company}</p>
                          <Badge variant={job.status === "closing" ? "destructive" : "secondary"}>
                            {job.status === "closing" ? "Closing Soon" : "Active"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{job.position}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{job.openings} openings</span>
                          <span>•</span>
                          <span>{job.applications} applications</span>
                          <span>•</span>
                          <span>Deadline: {job.deadline}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drives" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Placement Drives</CardTitle>
                <CardDescription>Scheduled company visits and recruitment events</CardDescription>
              </div>
              <Button>Schedule Drive</Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px]">
                <div className="space-y-4">
                  {upcomingDrives.map((drive) => (
                    <div
                      key={drive.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{drive.company}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <IconCalendarEvent className="size-4" />
                          {drive.date} at {drive.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{drive.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {drive.registrations} registrations
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button size="sm">Manage</Button>
                        <Button variant="outline" size="sm">Send Reminder</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Drives</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
