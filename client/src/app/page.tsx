import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

// Icons as components
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function LayoutDashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClipboardListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCapIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">JobPred</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#students" className="text-sm font-medium hover:text-primary transition-colors">
              For Students
            </Link>
            <Link href="#admin" className="text-sm font-medium hover:text-primary transition-colors">
              For Admins
            </Link>
            <Link href="#impact" className="text-sm font-medium hover:text-primary transition-colors">
              Impact
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedOut>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 blur-[100px]" />
        
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <SparklesIcon className="mr-1 h-3 w-3" />
            AI-Powered Placement Platform
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Your
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Campus Placements
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Build ATS-optimized CVs, get personalized job recommendations, and streamline your 
            placement process with our comprehensive AI-driven platform for students and placement committees.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link href="/sign-up">
                Start For Free
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8" asChild>
              <Link href="#features">
                Explore Features
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">80%+</div>
              <div className="mt-1 text-sm text-muted-foreground">Job-CV Match Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">40%</div>
              <div className="mt-1 text-sm text-muted-foreground">Higher Placement Rates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">70%</div>
              <div className="mt-1 text-sm text-muted-foreground">Reduced Admin Workload</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">100+</div>
              <div className="mt-1 text-sm text-muted-foreground">Job Sources Integrated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-y bg-muted/50 px-4 py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">The Challenge</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Why Campus Placements Fail</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Current placement systems are fragmented, manual, and fail to serve both students and administrators effectively.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <FileTextIcon className="h-5 w-5" />
                  Ineffective CVs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  75% of resumes fail ATS screening before reaching recruiters, 
                  leaving qualified students invisible to potential employers.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <TargetIcon className="h-5 w-5" />
                  No Personalization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Students apply to jobs blindly without understanding how their 
                  skills align with job requirements, leading to poor outcomes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                  <ClipboardListIcon className="h-5 w-5" />
                  Manual Processes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Placement committees spend hours on manual job posting, tracking, 
                  and reporting instead of strategic placement activities.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Platform Features</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Everything You Need</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A unified platform that bridges the gap between students seeking placements 
              and administrators managing the process.
            </p>
          </div>
        </div>
      </section>

      {/* Student Portal Section */}
      <section id="students" className="px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge className="mb-4">Student Portal</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Your Path to the Perfect Job
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get personalized recommendations, build professional CVs, and track your 
                placement journey all in one place.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileTextIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">LaTeX CV Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      Create professional, ATS-compliant CVs using beautiful LaTeX templates 
                      that stand out to recruiters.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <TargetIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">ATS Scoring & Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant feedback on your CV with detailed ATS compatibility scores 
                      and actionable improvement suggestions.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BriefcaseIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Job-CV Matching (80%+ Accuracy)</h3>
                    <p className="text-sm text-muted-foreground">
                      AI-powered matching algorithm analyzes your profile against job 
                      requirements to show your compatibility score.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <SparklesIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover jobs from college drives, Indeed, Naukri, Freshersworld, 
                      Superset, and company career pages—all tailored to you.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpenIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Placement Prep Resources</h3>
                    <p className="text-sm text-muted-foreground">
                      Access curated interview guides, aptitude tests, and coding practice 
                      materials to ace your placements.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="mt-8" size="lg" asChild>
                <Link href="/sign-up">
                  Create Your Profile
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Student Portal Preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl" />
              <Card className="relative overflow-hidden">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Your ATS Score</p>
                        <p className="text-3xl font-bold text-green-600">87/100</p>
                      </div>
                      <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-[87%] rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Matched Jobs</p>
                        <p className="text-xl font-semibold">24</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Applications</p>
                        <p className="text-xl font-semibold">8</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Interviews</p>
                        <p className="text-xl font-semibold">3</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Offers</p>
                        <p className="text-xl font-semibold">1</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Portal Section */}
      <section id="admin" className="px-4 py-20">
        <div className="container mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            {/* Admin Dashboard Preview */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 blur-xl" />
              <Card className="relative overflow-hidden">
                <CardHeader className="border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <h3 className="font-semibold">Placement Dashboard</h3>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">156</p>
                        <p className="text-xs text-muted-foreground">Active Jobs</p>
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">1,247</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">89%</p>
                        <p className="text-xs text-muted-foreground">Placed</p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <span className="text-sm">TCS - SDE Role</span>
                        <Badge variant="outline" className="text-xs">45 Applied</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <span className="text-sm">Infosys - Analyst</span>
                        <Badge variant="outline" className="text-xs">32 Applied</Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                        <span className="text-sm">Wipro - Developer</span>
                        <Badge variant="outline" className="text-xs">28 Applied</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge className="mb-4" variant="outline">Admin Portal</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">
                Streamline Placement Operations
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful tools for placement committees to manage jobs, track applications, 
                and generate insights—all with minimal effort.
              </p>
              
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <BriefcaseIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Job Posting & Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and publish job drives instantly with custom eligibility criteria, 
                      deadlines, and batch-specific targeting.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Batch & Student Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize students by batch, branch, and CGPA. Apply eligibility filters 
                      automatically for each job drive.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <ClipboardListIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Application Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      Track every application from submission to offer. Schedule tests, 
                      interviews, and manage the entire recruitment pipeline.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <BarChartIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-Time Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate automated reports on placement statistics, company participation, 
                      package trends, and student performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Role-Based Access Control</h3>
                    <p className="text-sm text-muted-foreground">
                      Define permissions for TPO, coordinators, and faculty with granular 
                      access control and audit trails.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button className="mt-8" size="lg" variant="outline" asChild>
                <Link href="/sign-up">
                  Request Admin Access
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Sources Section */}
      <section className="border-y bg-muted/30 px-4 py-16">
        <div className="container mx-auto text-center">
          <p className="text-sm font-medium text-muted-foreground mb-8">
            AGGREGATING JOBS FROM TRUSTED SOURCES
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70">
            <div className="text-xl font-bold">Indeed</div>
            <div className="text-xl font-bold">Naukri</div>
            <div className="text-xl font-bold">Freshersworld</div>
            <div className="text-xl font-bold">Superset</div>
            <div className="text-xl font-bold">LinkedIn</div>
            <div className="text-xl font-bold">Company Portals</div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="px-4 py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">Expected Impact</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Transforming Placement Outcomes</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our platform delivers measurable improvements across the entire placement ecosystem.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center border-green-200 dark:border-green-900">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <TrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-green-600">30-40%</CardTitle>
                <CardDescription className="text-base">Higher Placement Rates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Through better CV optimization, personalized job matching, and comprehensive 
                  preparation resources for students.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-blue-200 dark:border-blue-900">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <ClockIcon className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-blue-600">70%</CardTitle>
                <CardDescription className="text-base">Reduced Admin Workload</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Automation of repetitive tasks like job posting, eligibility filtering, 
                  application tracking, and report generation.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-purple-200 dark:border-purple-900">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                  <LayoutDashboardIcon className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-4xl font-bold text-purple-600">100%</CardTitle>
                <CardDescription className="text-base">Complete Transparency</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Real-time visibility into placement activities, application status, 
                  and analytics for all stakeholders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="bg-muted/50 px-4 py-20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Technology</Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Built with Modern Tech</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">Flask/Django</Badge>
                  <Badge variant="secondary">REST API</Badge>
                  <Badge variant="secondary">JWT Auth</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI/ML</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">HuggingFace</Badge>
                  <Badge variant="secondary">NLP</Badge>
                  <Badge variant="secondary">TF-IDF</Badge>
                  <Badge variant="secondary">BERT</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data & Scraping</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Selenium</Badge>
                  <Badge variant="secondary">BeautifulSoup</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 px-6 py-16 text-center md:px-12 md:py-24">
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Ready to Transform Your Placements?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Join thousands of students and placement committees already using JobPred 
                to achieve better outcomes.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" className="h-12 px-8" asChild>
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent border-white text-white hover:bg-white/10" asChild>
                  <Link href="/dashboard">
                    View Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-12">
        <div className="container mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCapIcon className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">JobPred</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Transforming campus placements with AI-powered CV optimization and 
                comprehensive management tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">CV Builder</Link></li>
                <li><Link href="#" className="hover:text-primary">ATS Scanner</Link></li>
                <li><Link href="#" className="hover:text-primary">Job Matching</Link></li>
                <li><Link href="#" className="hover:text-primary">Prep Resources</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Admins</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">Job Posting</Link></li>
                <li><Link href="#" className="hover:text-primary">Batch Management</Link></li>
                <li><Link href="#" className="hover:text-primary">Analytics</Link></li>
                <li><Link href="#" className="hover:text-primary">Reports</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 JobPred. All rights reserved. Built with ❤️ for better placements.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
