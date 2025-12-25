"use client"

import {
  IconBriefcase,
  IconCalendarEvent,
  IconFileDescription,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconCheck,
  IconX,
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

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface StudentDashboardContentProps {
  user: User
}

// Mock data for the student dashboard
const upcomingInterviews = [
  {
    id: 1,
    company: "Google",
    position: "Software Engineer Intern",
    date: "Dec 28, 2025",
    time: "10:00 AM",
    type: "Technical",
  },
  {
    id: 2,
    company: "Microsoft",
    position: "Product Manager Intern",
    date: "Dec 30, 2025",
    time: "2:00 PM",
    type: "HR",
  },
  {
    id: 3,
    company: "Amazon",
    position: "Data Analyst",
    date: "Jan 2, 2026",
    time: "11:00 AM",
    type: "Technical",
  },
]

const recentApplications = [
  {
    id: 1,
    company: "Netflix",
    position: "Frontend Developer",
    status: "pending",
    appliedDate: "Dec 20, 2025",
  },
  {
    id: 2,
    company: "Meta",
    position: "ML Engineer",
    status: "shortlisted",
    appliedDate: "Dec 18, 2025",
  },
  {
    id: 3,
    company: "Apple",
    position: "iOS Developer",
    status: "rejected",
    appliedDate: "Dec 15, 2025",
  },
  {
    id: 4,
    company: "Spotify",
    position: "Backend Engineer",
    status: "interview",
    appliedDate: "Dec 12, 2025",
  },
]

const recommendedJobs = [
  {
    id: 1,
    company: "Stripe",
    position: "Full Stack Developer",
    location: "Remote",
    salary: "$120k - $150k",
    match: 95,
  },
  {
    id: 2,
    company: "Airbnb",
    position: "Software Engineer",
    location: "San Francisco",
    salary: "$130k - $160k",
    match: 88,
  },
  {
    id: 3,
    company: "Uber",
    position: "Backend Developer",
    location: "New York",
    salary: "$110k - $140k",
    match: 82,
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary"><IconClock className="mr-1 size-3" />Pending</Badge>
    case "shortlisted":
      return <Badge className="bg-blue-500"><IconTrendingUp className="mr-1 size-3" />Shortlisted</Badge>
    case "interview":
      return <Badge className="bg-green-500"><IconCalendarEvent className="mr-1 size-3" />Interview</Badge>
    case "rejected":
      return <Badge variant="destructive"><IconX className="mr-1 size-3" />Rejected</Badge>
    case "accepted":
      return <Badge className="bg-green-600"><IconCheck className="mr-1 size-3" />Accepted</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function StudentDashboardContent({ user }: StudentDashboardContentProps) {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.first_name || "Student"}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your job search progress and upcoming activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <IconFileDescription className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <IconTrendingUp className="mr-1 size-3" />+4 this week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <IconCalendarEvent className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Next: Dec 28, 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              20.8% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <IconBriefcase className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="interviews" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="interviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your scheduled interviews for the next 2 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{interview.company}</p>
                        <p className="text-sm text-muted-foreground">{interview.position}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <IconCalendarEvent className="size-4" />
                          {interview.date} at {interview.time}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">{interview.type}</Badge>
                        <Button size="sm">Join</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{application.company}</p>
                        <p className="text-sm text-muted-foreground">{application.position}</p>
                        <p className="text-xs text-muted-foreground">Applied: {application.appliedDate}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(application.status)}
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Applications</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Jobs</CardTitle>
              <CardDescription>Jobs matching your profile and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{job.company}</p>
                        <p className="text-sm text-muted-foreground">{job.position}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-green-500">{job.match}% Match</Badge>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Browse All Jobs</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
