"use client"

import * as React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
  IconLoader2,
  IconSearch,
  IconBriefcase,
  IconMapPin,
  IconClock,
  IconCurrencyRupee,
  IconExternalLink,
  IconCheck,
  IconX,
  IconSparkles,
  IconUpload,
  IconFileText,
  IconRefresh,
  IconFilter,
  IconBuilding,
  IconBrandLinkedin,
  IconWorld,
  IconTrendingUp,
  IconTarget,
  IconCode,
  IconAlertCircle,
} from "@tabler/icons-react"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface Profile {
  id?: string
  user_id?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  college_name?: string
  department?: string
  skills?: string[]
  github_url?: string
  linkedin_url?: string
}

interface Skill {
  id?: string
  user_id?: string
  name: string
  level?: string
  category?: string
}

interface JobListing {
  id: string
  title: string
  company: string
  location: string
  job_type: string
  experience_required: string
  salary: string
  description: string
  skills_required: string[]
  posted_date: string
  apply_url: string
  source: string
  match_score: number
  matched_skills: string[]
  missing_skills: string[]
}

interface JobSearchResult {
  jobs: JobListing[]
  total_found: number
  search_keywords: string[]
  extracted_resume_skills: string[]
  platforms_searched: string[]
  message: string
}

interface JobFinderContentProps {
  user: User
  profile?: Profile | null
  skills?: Skill[]
}

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: IconBrandLinkedin },
  { id: "internshala", name: "Internshala", icon: IconBuilding },
  { id: "foundit", name: "Foundit", icon: IconWorld },
  { id: "naukri", name: "Naukri", icon: IconBriefcase },
  { id: "indeed", name: "Indeed", icon: IconSearch },
]

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
]

const LOCATIONS = [
  "India",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Remote",
]

export function JobFinderContent({ user, profile, skills }: JobFinderContentProps) {
  // State for resume input
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState("")
  const [useProfile, setUseProfile] = useState(true)
  
  // Search parameters
  const [keywords, setKeywords] = useState("")
  const [location, setLocation] = useState("India")
  const [jobType, setJobType] = useState("all")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["internshala", "naukri", "foundit"])
  
  // Results state
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<JobSearchResult | null>(null)
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([])
  
  // Filter state
  const [minMatchScore, setMinMatchScore] = useState(0)
  const [sortBy, setSortBy] = useState<"match_score" | "posted_date">("match_score")

  // Get skills from profile or skills list
  const userSkills = React.useMemo(() => {
    const skillNames: string[] = []
    
    if (profile?.skills && Array.isArray(profile.skills)) {
      skillNames.push(...profile.skills)
    }
    
    if (skills && Array.isArray(skills)) {
      skills.forEach(skill => {
        if (skill.name && !skillNames.includes(skill.name)) {
          skillNames.push(skill.name)
        }
      })
    }
    
    return skillNames
  }, [profile, skills])

  // Build resume text from profile
  const buildResumeFromProfile = useCallback(() => {
    if (!profile) return ""
    
    let text = ""
    
    if (profile.first_name || profile.last_name) {
      text += `${profile.first_name || ""} ${profile.last_name || ""}\n`
    }
    
    if (profile.email) {
      text += `Email: ${profile.email}\n`
    }
    
    if (profile.phone) {
      text += `Phone: ${profile.phone}\n`
    }
    
    if (profile.city || profile.state) {
      text += `Location: ${profile.city || ""}, ${profile.state || ""}\n`
    }
    
    if (profile.college_name) {
      text += `\nEducation:\n${profile.college_name}`
      if (profile.department) {
        text += ` - ${profile.department}`
      }
      text += "\n"
    }
    
    if (userSkills.length > 0) {
      text += `\nSkills:\n${userSkills.join(", ")}\n`
    }
    
    return text
  }, [profile, userSkills])

  // Handle platform toggle
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(platformId)) {
        return prev.filter(p => p !== platformId)
      } else {
        return [...prev, platformId]
      }
    })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Only PDF files are supported")
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size too large. Maximum 10MB allowed.")
        return
      }
      setResumeFile(file)
      setUseProfile(false)
      toast.success("Resume uploaded successfully")
    }
  }

  // Search for jobs
  const handleSearch = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform to search")
      return
    }

    let finalResumeText = ""
    
    if (useProfile && profile) {
      finalResumeText = buildResumeFromProfile()
    } else if (resumeFile) {
      // Will use PDF endpoint
    } else if (resumeText.trim()) {
      finalResumeText = resumeText
    }

    if (!finalResumeText && !resumeFile && !keywords.trim()) {
      toast.error("Please provide your resume or enter search keywords")
      return
    }

    setSearching(true)
    setResults(null)

    try {
      let response: Response
      let data: JobSearchResult

      if (resumeFile && !useProfile) {
        // Use PDF upload endpoint
        const formData = new FormData()
        formData.append("resume_pdf", resumeFile)
        formData.append("location", location)
        formData.append("job_type", jobType === "all" ? "" : jobType)
        if (keywords.trim()) {
          formData.append("keywords", keywords.trim())
        }
        formData.append("platforms", selectedPlatforms.join(","))

        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/job-finder/search-pdf`, {
          method: "POST",
          body: formData,
        })
      } else {
        // Use text endpoint
        const keywordsList = keywords.trim()
          ? keywords.split(",").map(k => k.trim()).filter(k => k)
          : userSkills.slice(0, 10)

        response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/job-finder/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume_text: finalResumeText,
            resume_skills: userSkills,
            keywords: keywordsList.length > 0 ? keywordsList : null,
            location: location,
            job_type: jobType === "all" ? "" : jobType,
            platforms: selectedPlatforms,
          }),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to search for jobs")
      }

      data = await response.json()
      setResults(data)
      setFilteredJobs(data.jobs)
      
      if (data.total_found === 0) {
        toast.info("No jobs found. Try adjusting your search criteria.")
      } else {
        toast.success(`Found ${data.total_found} jobs matching your profile!`)
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to search for jobs")
    } finally {
      setSearching(false)
    }
  }

  // Apply filters
  React.useEffect(() => {
    if (!results) return

    let jobs = [...results.jobs]

    // Filter by match score
    if (minMatchScore > 0) {
      jobs = jobs.filter(job => job.match_score >= minMatchScore)
    }

    // Sort
    if (sortBy === "match_score") {
      jobs.sort((a, b) => b.match_score - a.match_score)
    } else {
      // Sort by recency (newer first)
      jobs.sort((a, b) => {
        const aRecent = a.posted_date.toLowerCase().includes("today") || 
                        a.posted_date.toLowerCase().includes("hour") ? 1 : 0
        const bRecent = b.posted_date.toLowerCase().includes("today") || 
                        b.posted_date.toLowerCase().includes("hour") ? 1 : 0
        return bRecent - aRecent
      })
    }

    setFilteredJobs(jobs)
  }, [results, minMatchScore, sortBy])

  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "linkedin":
        return <IconBrandLinkedin className="h-4 w-4" />
      case "internshala":
        return <IconBuilding className="h-4 w-4" />
      default:
        return <IconWorld className="h-4 w-4" />
    }
  }

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-100"
    if (score >= 50) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <IconSearch className="h-8 w-8 text-primary" />
          Job Finder
        </h1>
        <p className="text-muted-foreground">
          Find jobs and internships matching your skills from multiple platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="h-5 w-5" />
                Resume
              </CardTitle>
              <CardDescription>
                Use your profile data or upload a resume for better matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="use-profile"
                    checked={useProfile}
                    onCheckedChange={(checked) => setUseProfile(checked === true)}
                  />
                  <Label htmlFor="use-profile" className="cursor-pointer">
                    Use my profile data ({userSkills.length} skills)
                  </Label>
                </div>
              )}

              {!useProfile && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="resume-upload">Upload Resume PDF</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="resume-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    {resumeFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {resumeFile.name}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or paste text
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume-text">Resume Text</Label>
                    <Textarea
                      id="resume-text"
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={6}
                    />
                  </div>
                </>
              )}

              {useProfile && userSkills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {userSkills.slice(0, 10).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {userSkills.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{userSkills.length - 10} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFilter className="h-5 w-5" />
                Search Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Additional Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., python, react, machine learning"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords to search for
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-type">Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWorld className="h-5 w-5" />
                Platforms
              </CardTitle>
              <CardDescription>
                Select job platforms to search
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon
                return (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => togglePlatform(platform.id)}
                    />
                    <Label
                      htmlFor={platform.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4" />
                      {platform.name}
                    </Label>
                  </div>
                )
              })}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={searching || selectedPlatforms.length === 0}
              >
                {searching ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching... (this may take a minute)
                  </>
                ) : (
                  <>
                    <IconSearch className="mr-2 h-4 w-4" />
                    Find Jobs
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results Summary */}
          {results && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="h-5 w-5 text-primary" />
                    Search Results
                  </CardTitle>
                  <Badge variant="secondary">
                    {filteredJobs.length} of {results.total_found} jobs
                  </Badge>
                </div>
                <CardDescription>
                  Searched: {results.platforms_searched.join(", ")} | 
                  Keywords: {results.search_keywords.slice(0, 5).join(", ")}
                  {results.search_keywords.length > 5 && "..."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Min Match Score:</Label>
                    <Select 
                      value={String(minMatchScore)} 
                      onValueChange={(v) => setMinMatchScore(Number(v))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="30">30%+</SelectItem>
                        <SelectItem value="50">50%+</SelectItem>
                        <SelectItem value="70">70%+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                    <Select 
                      value={sortBy} 
                      onValueChange={(v: "match_score" | "posted_date") => setSortBy(v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="match_score">Best Match</SelectItem>
                        <SelectItem value="posted_date">Most Recent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skills Extracted */}
                {results.extracted_resume_skills.length > 0 && (
                  <div>
                    <Label className="text-sm mb-2 block">Your Skills Detected:</Label>
                    <div className="flex flex-wrap gap-1">
                      {results.extracted_resume_skills.slice(0, 15).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <IconCode className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                      {results.extracted_resume_skills.length > 15 && (
                        <Badge variant="outline" className="text-xs">
                          +{results.extracted_resume_skills.length - 15} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Job Listings */}
          {searching ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <IconLoader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Searching job platforms...</p>
                    <p className="text-sm text-muted-foreground">
                      This may take a minute as we search across {selectedPlatforms.length} platform(s)
                    </p>
                  </div>
                  <Progress value={33} className="w-64" />
                </div>
              </CardContent>
            </Card>
          ) : results && filteredJobs.length > 0 ? (
            <ScrollArea className="h-200">
              <div className="space-y-4 pr-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight">
                            {job.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <IconBuilding className="h-4 w-4 shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            className={`${getMatchScoreColor(job.match_score)} text-sm font-semibold`}
                          >
                            <IconTarget className="h-3 w-3 mr-1" />
                            {job.match_score}% Match
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {getSourceIcon(job.source)}
                            <span className="ml-1">{job.source}</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Job Meta */}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconMapPin className="h-4 w-4" />
                          {job.location || "Not specified"}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconBriefcase className="h-4 w-4" />
                          {job.job_type || "Full-time"}
                        </span>
                        {job.experience_required && (
                          <span className="flex items-center gap-1">
                            <IconClock className="h-4 w-4" />
                            {job.experience_required}
                          </span>
                        )}
                        {job.salary && job.salary !== "Not disclosed" && (
                          <span className="flex items-center gap-1">
                            <IconCurrencyRupee className="h-4 w-4" />
                            {job.salary}
                          </span>
                        )}
                        {job.posted_date && (
                          <span className="flex items-center gap-1 text-xs">
                            <IconClock className="h-3 w-3" />
                            {job.posted_date}
                          </span>
                        )}
                      </div>

                      {/* Matched Skills */}
                      {job.matched_skills.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Matching Skills:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.matched_skills.slice(0, 8).map((skill, idx) => (
                              <Badge key={idx} variant="default" className="text-xs bg-green-600">
                                <IconCheck className="h-3 w-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                            {job.matched_skills.length > 8 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.matched_skills.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {job.missing_skills.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Skills to Learn:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.missing_skills.slice(0, 5).map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs text-orange-600 border-orange-300">
                                <IconTrendingUp className="h-3 w-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                            {job.missing_skills.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.missing_skills.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        asChild
                        disabled={!job.apply_url}
                      >
                        <a 
                          href={job.apply_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <IconExternalLink className="mr-2 h-4 w-4" />
                          Apply on {job.source.charAt(0).toUpperCase() + job.source.slice(1)}
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : results && filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <IconAlertCircle className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">No jobs match your filters</p>
                    <p className="text-sm text-muted-foreground">
                      Try lowering the minimum match score or adjusting your search criteria
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setMinMatchScore(0)}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <IconSearch className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Ready to find your next opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Configure your search settings and click "Find Jobs" to discover 
                      jobs matching your skills and preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
