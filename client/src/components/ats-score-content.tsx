"use client"

import * as React from "react"
import { useState } from "react"
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
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  IconTarget,
  IconLoader2,
  IconFileText,
  IconBriefcase,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconBulb,
  IconChartBar,
  IconCode,
  IconClock,
  IconFileDescription,
  IconSparkles,
  IconTrendingUp,
  IconInfoCircle,
  IconUpload,
} from "@tabler/icons-react"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface ATSResult {
  overall_score: number
  category: string
  category_description: string
  breakdown: {
    keyword_match: {
      score: number
      matched: string[]
      missing: string[]
      extra: string[]
      match_percentage: number
      weight: number
    }
    experience_match: {
      score: number
      message: string
      resume_years: number | null
      required_years: number | null
      weight: number
    }
    formatting: {
      score: number
      issues: string[]
      has_email: boolean
      has_phone: boolean
      word_count: number
      detected_sections: string[]
      weight: number
    }
    semantic_similarity: {
      score: number
      method: string
      weight: number
    }
  }
  extracted_data: {
    resume_skills: string[]
    jd_skills: string[]
    resume_experience_years: number | null
    jd_experience_years: number | null
    resume_education: Array<{ degree: string; found: string }>
    jd_education: Array<{ degree: string; found: string }>
  }
  recommendations: Array<{
    category: string
    priority: string
    message: string
    details: string
  }>
  extracted_info?: {
    text_length: number
    word_count: number
    page_count: number
    filename: string
  }
}

interface ATSScoreContentProps {
  user: User
}

export function ATSScoreContent({ user }: ATSScoreContentProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<ATSResult | null>(null)

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error("Please upload your resume PDF")
      return
    }

    if (!jobDescription.trim()) {
      toast.error("Please enter the job description")
      return
    }

    if (jobDescription.trim().length < 50) {
      toast.error("Job description is too short for meaningful analysis")
      return
    }

    // Validate file type
    if (!resumeFile.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files are supported")
      return
    }

    // Validate file size (max 10MB)
    if (resumeFile.size > 10 * 1024 * 1024) {
      toast.error("File size too large. Maximum 10MB allowed.")
      return
    }

    setAnalyzing(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("resume_pdf", resumeFile)
      formData.append("job_description", jobDescription)

      console.log("Sending ATS analysis request:", {
        filename: resumeFile.name,
        size: resumeFile.size,
        jd_length: jobDescription.length
      })

      const response = await fetch("/api/ats-check-pdf", {
        method: "POST",
        body: formData,
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("API Error:", error)
        throw new Error(error.error || "Failed to analyze")
      }

      const data = await response.json()
      console.log("Analysis result:", data)
      setResult(data)
      toast.success("ATS analysis complete!")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to analyze resume")
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "Excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Good":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Fair":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <IconTarget className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">ATS Score Checker</h1>
        </div>
        <p className="text-muted-foreground">
          Analyze your resume against a job description to see how well it matches ATS requirements.
          Get a detailed score breakdown and actionable recommendations.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Resume PDF
            </CardTitle>
            <CardDescription>
              Upload your resume as a PDF file. The system will extract and analyze the text content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="resume-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    resumeFile 
                      ? "border-green-500 bg-green-50 dark:bg-green-950" 
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-900"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {resumeFile ? (
                      <>
                        <IconCheck className="w-8 h-8 mb-2 text-green-500" />
                        <p className="mb-2 text-sm text-green-700 dark:text-green-300">
                          <span className="font-semibold">{resumeFile.name}</span>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <IconUpload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PDF files only</p>
                      </>
                    )}
                  </div>
                  <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setResumeFile(file)
                      }
                    }}
                  />
                </Label>
              </div>
              
              {resumeFile && (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <IconFileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{resumeFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResumeFile(null)}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBriefcase className="h-5 w-5" />
              Job Description
            </CardTitle>
            <CardDescription>
              Paste the job description you want to match against.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste the job description here...

Example:
Software Engineer
We are looking for a skilled Software Engineer to join our team.

Requirements:
- 3+ years of experience in software development
- Proficiency in JavaScript, TypeScript, React
- Experience with Node.js and REST APIs
- Strong problem-solving skills..."
              className="min-h-[300px] font-mono text-sm"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {jobDescription.length > 0 && `${jobDescription.split(/\s+/).filter(Boolean).length} words`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleAnalyze}
          disabled={analyzing || !resumeFile || !jobDescription.trim()}
          className="min-w-[200px]"
        >
          {analyzing ? (
            <>
              <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <IconSparkles className="mr-2 h-5 w-5" />
              Analyze ATS Compatibility
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Separator />
          
          {/* Overall Score Card */}
          <Card className="border-2" style={{ borderColor: result.overall_score >= 60 ? 'var(--primary)' : 'var(--destructive)' }}>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                <div className="flex flex-col items-center gap-2 md:items-start">
                  <Badge className={getCategoryBadgeColor(result.category)}>
                    {result.category}
                  </Badge>
                  <p className="text-center text-muted-foreground md:text-left">
                    {result.category_description}
                  </p>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-32 w-32 -rotate-90 transform">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(result.overall_score / 100) * 352} 352`}
                        strokeLinecap="round"
                        className={getScoreColor(result.overall_score)}
                      />
                    </svg>
                    <span className={`absolute text-3xl font-bold ${getScoreColor(result.overall_score)}`}>
                      {Math.round(result.overall_score)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">ATS Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="breakdown" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            {/* Score Breakdown Tab */}
            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Keyword Match */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <IconCode className="h-4 w-4" />
                        Keyword Match
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Weight: {(result.breakdown.keyword_match.weight * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(result.breakdown.keyword_match.score)}`}>
                        {result.breakdown.keyword_match.score}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.breakdown.keyword_match.match_percentage}% match rate
                      </span>
                    </div>
                    <Progress 
                      value={result.breakdown.keyword_match.score} 
                      className="h-2"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {result.breakdown.keyword_match.matched.length} matched, {result.breakdown.keyword_match.missing.length} missing
                    </p>
                  </CardContent>
                </Card>

                {/* Experience Match */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <IconClock className="h-4 w-4" />
                        Experience Match
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Weight: {(result.breakdown.experience_match.weight * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(result.breakdown.experience_match.score)}`}>
                        {result.breakdown.experience_match.score}%
                      </span>
                    </div>
                    <Progress 
                      value={result.breakdown.experience_match.score} 
                      className="h-2"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {result.breakdown.experience_match.message}
                    </p>
                  </CardContent>
                </Card>

                {/* Formatting */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <IconFileDescription className="h-4 w-4" />
                        Formatting
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Weight: {(result.breakdown.formatting.weight * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(result.breakdown.formatting.score)}`}>
                        {result.breakdown.formatting.score}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {result.breakdown.formatting.word_count} words
                      </span>
                    </div>
                    <Progress 
                      value={result.breakdown.formatting.score} 
                      className="h-2"
                    />
                    <div className="mt-2 flex gap-2">
                      {result.breakdown.formatting.has_email ? (
                        <Badge variant="outline" className="text-green-600">
                          <IconCheck className="mr-1 h-3 w-3" /> Email
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          <IconX className="mr-1 h-3 w-3" /> Email
                        </Badge>
                      )}
                      {result.breakdown.formatting.has_phone ? (
                        <Badge variant="outline" className="text-green-600">
                          <IconCheck className="mr-1 h-3 w-3" /> Phone
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          <IconX className="mr-1 h-3 w-3" /> Phone
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Semantic Similarity */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-base">
                      <span className="flex items-center gap-2">
                        <IconTrendingUp className="h-4 w-4" />
                        Semantic Similarity
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <IconInfoCircle className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Weight: {(result.breakdown.semantic_similarity.weight * 100)}%</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(result.breakdown.semantic_similarity.score)}`}>
                        {result.breakdown.semantic_similarity.score}%
                      </span>
                    </div>
                    <Progress 
                      value={result.breakdown.semantic_similarity.score} 
                      className="h-2"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Using {result.breakdown.semantic_similarity.method}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Matched Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconCheck className="h-5 w-5 text-green-500" />
                      Matched Skills ({result.breakdown.keyword_match.matched.length})
                    </CardTitle>
                    <CardDescription>
                      Skills found in both your resume and the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.keyword_match.matched.length > 0 ? (
                        result.breakdown.keyword_match.matched.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No matched skills found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconX className="h-5 w-5 text-red-500" />
                      Missing Skills ({result.breakdown.keyword_match.missing.length})
                    </CardTitle>
                    <CardDescription>
                      Skills required in the job description but not in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.keyword_match.missing.length > 0 ? (
                        result.breakdown.keyword_match.missing.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="default"
                            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No missing skills - great job!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Extra Skills */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <IconSparkles className="h-5 w-5 text-blue-500" />
                      Additional Skills ({result.breakdown.keyword_match.extra?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Skills in your resume not mentioned in the job description (bonus points!)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.keyword_match.extra && result.breakdown.keyword_match.extra.length > 0 ? (
                        result.breakdown.keyword_match.extra.map((skill, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="border-blue-500 text-blue-700 dark:text-blue-300"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No additional skills detected</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBulb className="h-5 w-5 text-yellow-500" />
                    Improvement Recommendations
                  </CardTitle>
                  <CardDescription>
                    Actionable suggestions to improve your ATS score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className="flex gap-4 rounded-lg border p-4"
                      >
                        <div className="flex-shrink-0">
                          {rec.priority === "high" ? (
                            <IconAlertTriangle className="h-5 w-5 text-red-500" />
                          ) : rec.priority === "medium" ? (
                            <IconAlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <IconInfoCircle className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getPriorityBadgeColor(rec.priority)}>
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline">{rec.category}</Badge>
                          </div>
                          <p className="font-medium">{rec.message}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {rec.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Detected Sections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detected Resume Sections</CardTitle>
                    <CardDescription>
                      Standard sections identified in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.breakdown.formatting.detected_sections.length > 0 ? (
                        result.breakdown.formatting.detected_sections.map((section, index) => (
                          <Badge key={index} variant="secondary" className="capitalize">
                            {section}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No standard sections detected. Consider using clear section headers.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Formatting Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Formatting Issues</CardTitle>
                    <CardDescription>
                      Potential formatting problems identified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.breakdown.formatting.issues.length > 0 ? (
                      <ul className="space-y-2">
                        {result.breakdown.formatting.issues.map((issue, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <IconAlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <IconCheck className="h-4 w-4" />
                        No formatting issues detected
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Experience Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Experience Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Experience:</span>
                      <span className="font-medium">
                        {result.extracted_data.resume_experience_years !== null 
                          ? `${result.extracted_data.resume_experience_years} years`
                          : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Required Experience:</span>
                      <span className="font-medium">
                        {result.extracted_data.jd_experience_years !== null 
                          ? `${result.extracted_data.jd_experience_years} years`
                          : "Not specified"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Education Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Education Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Your Education:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_data.resume_education.length > 0 ? (
                          result.extracted_data.resume_education.map((edu, index) => (
                            <Badge key={index} variant="secondary" className="capitalize">
                              {edu.degree}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not detected</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Required Education:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.extracted_data.jd_education.length > 0 ? (
                          result.extracted_data.jd_education.map((edu, index) => (
                            <Badge key={index} variant="outline" className="capitalize">
                              {edu.degree}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PDF Info Card - only show if extracted_info exists */}
                {result.extracted_info && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base">PDF Extraction Info</CardTitle>
                      <CardDescription>
                        Information about the uploaded PDF and text extraction
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Filename:</span>
                            <span className="font-medium text-sm">{result.extracted_info.filename}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pages:</span>
                            <span className="font-medium">{result.extracted_info.page_count}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Extracted Text Length:</span>
                            <span className="font-medium">{result.extracted_info.text_length.toLocaleString()} chars</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Word Count:</span>
                            <span className="font-medium">{result.extracted_info.word_count.toLocaleString()} words</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* All Detected Skills */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">All Extracted Skills</CardTitle>
                    <CardDescription>
                      Complete list of skills detected from both documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium mb-2">From Your Resume ({result.extracted_data.resume_skills.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {result.extracted_data.resume_skills.length > 0 ? (
                            result.extracted_data.resume_skills.map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No skills detected</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">From Job Description ({result.extracted_data.jd_skills.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {result.extracted_data.jd_skills.length > 0 ? (
                            result.extracted_data.jd_skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No skills detected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconChartBar className="h-4 w-4 text-primary" />
              What is ATS?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              An Applicant Tracking System (ATS) is software used by companies to filter resumes before human review.
              Over 90% of large companies use ATS to manage job applications and parse PDF resumes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconTarget className="h-4 w-4 text-primary" />
              PDF Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Our system extracts text from your PDF resume and analyzes it using advanced NLP techniques.
              Ensure your PDF contains readable text for best results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <IconBulb className="h-4 w-4 text-primary" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Use PDFs with selectable text, avoid image-based or scanned PDFs. Include keywords from the job description
              and use standard section headers for better ATS compatibility.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
