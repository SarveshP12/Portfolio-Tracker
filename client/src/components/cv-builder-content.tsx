"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  IconBriefcase,
  IconCode,
  IconCertificate,
  IconTrophy,
  IconActivity,
  IconPlus,
  IconTrash,
  IconLoader2,
  IconDownload,
  IconX,
  IconBrandGithub,
  IconExternalLink,
  IconStar,
  IconGitFork,
  IconRefresh,
  IconCheck,
  IconFileTypePdf,
  IconUpload,
  IconEye,
  IconDeviceFloppy,
} from "@tabler/icons-react"

interface User {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
}

interface WorkExperience {
  id: string
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  pdfUrl?: string
}

interface Skill {
  id: string
  name: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert"
  category: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
  pdfUrl?: string
}

interface Award {
  id: string
  title: string
  issuer: string
  date: string
  description: string
  pdfUrl?: string
}

interface ExtraCurricular {
  id: string
  activity: string
  organization: string
  role: string
  startDate: string
  endDate: string
  description: string
  pdfUrl?: string
}

interface GitHubProject {
  id: number
  name: string
  fullName: string
  description: string | null
  url: string
  primaryLanguage: string | null
  topics: string[]
  stars: number
  forks: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  homepage: string | null
}

interface CVBuilderContentProps {
  user: User
}

export function CVBuilderContent({ user }: CVBuilderContentProps) {
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  
  // Section-specific saving states
  const [savingWorkExp, setSavingWorkExp] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)
  const [savingCerts, setSavingCerts] = useState(false)
  const [savingAwards, setSavingAwards] = useState(false)
  const [savingActivities, setSavingActivities] = useState(false)
  const [savingProjects, setSavingProjects] = useState(false)
  
  // Work Experience State - separate saved and editing
  const [savedWorkExperiences, setSavedWorkExperiences] = useState<WorkExperience[]>([])
  const [editingWorkExperience, setEditingWorkExperience] = useState<WorkExperience | null>(null)
  
  // Skills State
  const [savedSkills, setSavedSkills] = useState<Skill[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newSkillLevel, setNewSkillLevel] = useState<Skill["level"]>("Intermediate")
  const [newSkillCategory, setNewSkillCategory] = useState("Technical")
  
  // Certifications State - separate saved and editing
  const [savedCertifications, setSavedCertifications] = useState<Certification[]>([])
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)
  
  // Awards State - separate saved and editing
  const [savedAwards, setSavedAwards] = useState<Award[]>([])
  const [editingAward, setEditingAward] = useState<Award | null>(null)
  
  // Extra Curricular State - separate saved and editing
  const [savedExtraCurriculars, setSavedExtraCurriculars] = useState<ExtraCurricular[]>([])
  const [editingExtraCurricular, setEditingExtraCurricular] = useState<ExtraCurricular | null>(null)

  // GitHub Projects State
  const [githubProjects, setGithubProjects] = useState<GitHubProject[]>([])
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set())
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [projectsError, setProjectsError] = useState<string | null>(null)

  // PDF Upload State
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null)

  // Fetch CV data on mount
  useEffect(() => {
    const fetchCVData = async () => {
      try {
        const response = await fetch("/api/cv")
        if (response.ok) {
          const data = await response.json()
          
          // Map database format to component format - load into saved states
          if (data.workExperiences?.length) {
            setSavedWorkExperiences(data.workExperiences.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 9),
              company: item.company || "",
              position: item.position || "",
              location: item.location || "",
              startDate: item.start_date || "",
              endDate: item.end_date || "",
              current: item.is_current || false,
              description: item.description || "",
              pdfUrl: item.pdf_url || undefined
            })))
          }
          
          if (data.skills?.length) {
            setSavedSkills(data.skills.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 9),
              name: item.name || "",
              level: item.level || "Intermediate",
              category: item.category || "Technical"
            })))
          }
          
          if (data.certifications?.length) {
            setSavedCertifications(data.certifications.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 9),
              name: item.name || "",
              issuer: item.issuer || "",
              issueDate: item.issue_date || "",
              expiryDate: item.expiry_date || "",
              credentialId: item.credential_id || "",
              credentialUrl: item.credential_url || "",
              pdfUrl: item.pdf_url || undefined
            })))
          }
          
          if (data.awards?.length) {
            setSavedAwards(data.awards.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 9),
              title: item.title || "",
              issuer: item.issuer || "",
              date: item.date || "",
              description: item.description || "",
              pdfUrl: item.pdf_url || undefined
            })))
          }
          
          if (data.extraCurriculars?.length) {
            setSavedExtraCurriculars(data.extraCurriculars.map((item: any) => ({
              id: item.id || Math.random().toString(36).substring(2, 9),
              activity: item.activity || "",
              organization: item.organization || "",
              role: item.role || "",
              startDate: item.start_date || "",
              endDate: item.end_date || "",
              description: item.description || "",
              pdfUrl: item.pdf_url || undefined
            })))
          }
          
          if (data.selectedProjects?.length) {
            setSelectedProjects(new Set(data.selectedProjects))
          }
        }
      } catch (error) {
        console.error("Error fetching CV data:", error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchCVData()
  }, [])

  // Save section to database
  const saveSection = async (
    type: string, 
    data: any, 
    setSavingState: (value: boolean) => void
  ) => {
    setSavingState(true)
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data })
      })
      
      if (!response.ok) {
        throw new Error("Failed to save")
      }
      
      toast.success("Saved successfully!")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setSavingState(false)
    }
  }

  // Generic PDF upload handler
  const handlePdfUpload = async (
    file: File,
    itemId: string,
    type: 'work' | 'certification' | 'award' | 'activity'
  ) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return
    }

    setUploadingPdfId(itemId)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("itemId", itemId)

      const response = await fetch("/api/upload-certificate", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()

      // Update the appropriate state based on type
      switch (type) {
        case 'work':
          setSavedWorkExperiences(prev => 
            prev.map((item: WorkExperience) => item.id === itemId ? { ...item, pdfUrl: data.url } : item)
          )
          break
        case 'certification':
          setSavedCertifications(prev => 
            prev.map((item: Certification) => item.id === itemId ? { ...item, pdfUrl: data.url } : item)
          )
          break
        case 'award':
          setSavedAwards(prev => 
            prev.map((item: Award) => item.id === itemId ? { ...item, pdfUrl: data.url } : item)
          )
          break
        case 'activity':
          setSavedExtraCurriculars(prev => 
            prev.map((item: ExtraCurricular) => item.id === itemId ? { ...item, pdfUrl: data.url } : item)
          )
          break
      }

      toast.success("Certificate uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload certificate")
    } finally {
      setUploadingPdfId(null)
    }
  }

  // Remove PDF handler
  const handleRemovePdf = async (
    itemId: string,
    pdfUrl: string,
    type: 'work' | 'certification' | 'award' | 'activity'
  ) => {
    try {
      const response = await fetch("/api/upload-certificate", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pdfUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete certificate")
      }

      // Update the appropriate state based on type
      switch (type) {
        case 'work':
          setSavedWorkExperiences(prev => 
            prev.map((item: WorkExperience) => item.id === itemId ? { ...item, pdfUrl: undefined } : item)
          )
          break
        case 'certification':
          setSavedCertifications(prev => 
            prev.map((item: Certification) => item.id === itemId ? { ...item, pdfUrl: undefined } : item)
          )
          break
        case 'award':
          setSavedAwards(prev => 
            prev.map((item: Award) => item.id === itemId ? { ...item, pdfUrl: undefined } : item)
          )
          break
        case 'activity':
          setSavedExtraCurriculars(prev => 
            prev.map((item: ExtraCurricular) => item.id === itemId ? { ...item, pdfUrl: undefined } : item)
          )
          break
      }

      toast.success("Certificate removed successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete certificate")
    }
  }

  // Toggle project selection
  const toggleProjectSelection = (projectId: number) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  // Select all projects
  const selectAllProjects = () => {
    setSelectedProjects(new Set(githubProjects.map(p => p.id)))
  }

  // Deselect all projects
  const deselectAllProjects = () => {
    setSelectedProjects(new Set())
  }

  // Fetch GitHub Projects
  const fetchGitHubProjects = async () => {
    setLoadingProjects(true)
    setProjectsError(null)
    try {
      const response = await fetch("/api/github-repos")
      const data = await response.json()
      
      if (!response.ok) {
        setProjectsError(data.error || "Failed to fetch GitHub projects")
        return
      }
      
      setGithubProjects(data.repositories || [])
    } catch (error) {
      setProjectsError("Failed to fetch GitHub projects. Please try again.")
      console.error("Error fetching GitHub projects:", error)
    } finally {
      setLoadingProjects(false)
    }
  }

  // Fetch GitHub projects on mount
  useEffect(() => {
    fetchGitHubProjects()
  }, [])

  // Generate unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9)

  // Work Experience Handlers
  const startNewWorkExperience = () => {
    setEditingWorkExperience({
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    })
  }

  const updateEditingWorkExperience = (field: keyof WorkExperience, value: string | boolean) => {
    if (editingWorkExperience) {
      setEditingWorkExperience({ ...editingWorkExperience, [field]: value })
    }
  }

  const cancelEditingWorkExperience = () => {
    setEditingWorkExperience(null)
  }

  const saveWorkExperience = async () => {
    if (!editingWorkExperience || !editingWorkExperience.company || !editingWorkExperience.position) {
      toast.error("Please fill in company and position")
      return
    }
    
    setSavingWorkExp(true)
    try {
      const updatedList = [...savedWorkExperiences, editingWorkExperience]
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "work_experiences", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to save")
      
      setSavedWorkExperiences(updatedList)
      setEditingWorkExperience(null)
      toast.success("Work experience saved!")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setSavingWorkExp(false)
    }
  }

  const removeSavedWorkExperience = async (id: string) => {
    setSavingWorkExp(true)
    try {
      const updatedList = savedWorkExperiences.filter(exp => exp.id !== id)
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "work_experiences", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      setSavedWorkExperiences(updatedList)
      toast.success("Work experience removed!")
    } catch (error) {
      toast.error("Failed to remove. Please try again.")
    } finally {
      setSavingWorkExp(false)
    }
  }

  // Skills Handlers
  const addSkill = async () => {
    if (!newSkill.trim()) return
    
    const skill: Skill = {
      id: generateId(),
      name: newSkill.trim(),
      level: newSkillLevel,
      category: newSkillCategory,
    }
    
    setSavingSkills(true)
    try {
      const updatedList = [...savedSkills, skill]
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "skills", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to save")
      
      setSavedSkills(updatedList)
      setNewSkill("")
      toast.success("Skill added!")
    } catch (error) {
      toast.error("Failed to add skill. Please try again.")
    } finally {
      setSavingSkills(false)
    }
  }

  const removeSkill = async (id: string) => {
    setSavingSkills(true)
    try {
      const updatedList = savedSkills.filter(skill => skill.id !== id)
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "skills", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      setSavedSkills(updatedList)
      toast.success("Skill removed!")
    } catch (error) {
      toast.error("Failed to remove skill. Please try again.")
    } finally {
      setSavingSkills(false)
    }
  }

  // Certifications Handlers
  const startNewCertification = () => {
    setEditingCertification({
      id: generateId(),
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    })
  }

  const updateEditingCertification = (field: keyof Certification, value: string) => {
    if (editingCertification) {
      setEditingCertification({ ...editingCertification, [field]: value })
    }
  }

  const cancelEditingCertification = () => {
    setEditingCertification(null)
  }

  const saveCertification = async () => {
    if (!editingCertification || !editingCertification.name || !editingCertification.issuer) {
      toast.error("Please fill in certification name and issuer")
      return
    }
    
    setSavingCerts(true)
    try {
      const updatedList = [...savedCertifications, editingCertification]
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "certifications", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to save")
      
      setSavedCertifications(updatedList)
      setEditingCertification(null)
      toast.success("Certification saved!")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setSavingCerts(false)
    }
  }

  const removeSavedCertification = async (id: string) => {
    setSavingCerts(true)
    try {
      const updatedList = savedCertifications.filter(cert => cert.id !== id)
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "certifications", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      setSavedCertifications(updatedList)
      toast.success("Certification removed!")
    } catch (error) {
      toast.error("Failed to remove. Please try again.")
    } finally {
      setSavingCerts(false)
    }
  }

  // Awards Handlers
  const startNewAward = () => {
    setEditingAward({
      id: generateId(),
      title: "",
      issuer: "",
      date: "",
      description: "",
    })
  }

  const updateEditingAward = (field: keyof Award, value: string) => {
    if (editingAward) {
      setEditingAward({ ...editingAward, [field]: value })
    }
  }

  const cancelEditingAward = () => {
    setEditingAward(null)
  }

  const saveAward = async () => {
    if (!editingAward || !editingAward.title) {
      toast.error("Please fill in award title")
      return
    }
    
    setSavingAwards(true)
    try {
      const updatedList = [...savedAwards, editingAward]
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "awards", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to save")
      
      setSavedAwards(updatedList)
      setEditingAward(null)
      toast.success("Award saved!")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setSavingAwards(false)
    }
  }

  const removeSavedAward = async (id: string) => {
    setSavingAwards(true)
    try {
      const updatedList = savedAwards.filter(award => award.id !== id)
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "awards", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      setSavedAwards(updatedList)
      toast.success("Award removed!")
    } catch (error) {
      toast.error("Failed to remove. Please try again.")
    } finally {
      setSavingAwards(false)
    }
  }

  // Extra Curricular Handlers
  const startNewExtraCurricular = () => {
    setEditingExtraCurricular({
      id: generateId(),
      activity: "",
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    })
  }

  const updateEditingExtraCurricular = (field: keyof ExtraCurricular, value: string) => {
    if (editingExtraCurricular) {
      setEditingExtraCurricular({ ...editingExtraCurricular, [field]: value })
    }
  }

  const cancelEditingExtraCurricular = () => {
    setEditingExtraCurricular(null)
  }

  const saveExtraCurricular = async () => {
    if (!editingExtraCurricular || !editingExtraCurricular.activity) {
      toast.error("Please fill in activity name")
      return
    }
    
    setSavingActivities(true)
    try {
      const updatedList = [...savedExtraCurriculars, editingExtraCurricular]
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "extra_curriculars", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to save")
      
      setSavedExtraCurriculars(updatedList)
      setEditingExtraCurricular(null)
      toast.success("Activity saved!")
    } catch (error) {
      console.error("Error saving:", error)
      toast.error("Failed to save. Please try again.")
    } finally {
      setSavingActivities(false)
    }
  }

  const removeSavedExtraCurricular = async (id: string) => {
    setSavingActivities(true)
    try {
      const updatedList = savedExtraCurriculars.filter(activity => activity.id !== id)
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "extra_curriculars", data: updatedList })
      })
      
      if (!response.ok) throw new Error("Failed to delete")
      
      setSavedExtraCurriculars(updatedList)
      toast.success("Activity removed!")
    } catch (error) {
      toast.error("Failed to remove. Please try again.")
    } finally {
      setSavingActivities(false)
    }
  }

  // Save CV
  const saveCV = async () => {
    setSaving(true)
    try {
      // Here you would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated delay
      toast.success("CV saved successfully!")
    } catch (error) {
      toast.error("Failed to save CV")
    } finally {
      setSaving(false)
    }
  }

  // Export CV
  const exportCV = () => {
    toast.info("CV export feature coming soon!")
  }

  const skillLevels: Skill["level"][] = ["Beginner", "Intermediate", "Advanced", "Expert"]
  const skillCategories = ["Technical", "Soft Skills", "Languages", "Tools", "Frameworks", "Other"]

  const getSkillLevelColor = (level: Skill["level"]) => {
    switch (level) {
      case "Beginner": return "bg-gray-500"
      case "Intermediate": return "bg-blue-500"
      case "Advanced": return "bg-green-500"
      case "Expert": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">CV Builder</h1>
            <p className="text-muted-foreground">
              Build your professional CV with detailed information
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCV}>
              <IconDownload className="mr-2 h-4 w-4" />
              Export CV
            </Button>
            <Button onClick={saveCV} disabled={saving}>
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {saving ? "Saving..." : "Save CV"}
            </Button>
          </div>
        </div>

        {/* CV Sections Tabs */}
      <Tabs defaultValue="work-experience" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="work-experience" className="flex items-center gap-2">
            <IconBriefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <IconBrandGithub className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <IconCode className="h-4 w-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="certifications" className="flex items-center gap-2">
            <IconCertificate className="h-4 w-4" />
            <span className="hidden sm:inline">Certifications</span>
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center gap-2">
            <IconTrophy className="h-4 w-4" />
            <span className="hidden sm:inline">Awards</span>
          </TabsTrigger>
          <TabsTrigger value="extra-curricular" className="flex items-center gap-2">
            <IconActivity className="h-4 w-4" />
            <span className="hidden sm:inline">Activities</span>
          </TabsTrigger>
        </TabsList>

        {/* Work Experience Tab */}
        <TabsContent value="work-experience" className="mt-6 space-y-6">
          {/* Saved Work Experiences */}
          {savedWorkExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconCheck className="h-5 w-5 text-green-500" />
                  Saved Work Experiences ({savedWorkExperiences.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedWorkExperiences.map((exp) => (
                  <div key={exp.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{exp.position}</h4>
                        {exp.pdfUrl && <IconFileTypePdf className="h-4 w-4 text-red-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.location && `${exp.location} • `}
                        {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2 line-clamp-2">{exp.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      onClick={() => removeSavedWorkExperience(exp.id)}
                      disabled={savingWorkExp}
                    >
                      <IconTrash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Add New Work Experience Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconBriefcase className="h-5 w-5" />
                    {editingWorkExperience ? "Add Work Experience" : "Work Experience"}
                  </CardTitle>
                  <CardDescription>
                    Add your professional work experience, internships, and part-time jobs
                  </CardDescription>
                </div>
                {!editingWorkExperience && (
                  <Button onClick={startNewWorkExperience} size="sm">
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Experience
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!editingWorkExperience ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconBriefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Add Experience" to add a new work experience</p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        placeholder="e.g., Google, Microsoft"
                        value={editingWorkExperience.company}
                        onChange={(e) => updateEditingWorkExperience("company", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Position/Role *</Label>
                      <Input
                        placeholder="e.g., Software Engineer Intern"
                        value={editingWorkExperience.position}
                        onChange={(e) => updateEditingWorkExperience("position", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        placeholder="e.g., Bangalore, India"
                        value={editingWorkExperience.location}
                        onChange={(e) => updateEditingWorkExperience("location", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date *</Label>
                      <Input
                        type="month"
                        value={editingWorkExperience.startDate}
                        onChange={(e) => updateEditingWorkExperience("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="month"
                        value={editingWorkExperience.endDate}
                        disabled={editingWorkExperience.current}
                        placeholder={editingWorkExperience.current ? "Present" : ""}
                        onChange={(e) => updateEditingWorkExperience("endDate", e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="current-work"
                          checked={editingWorkExperience.current}
                          onChange={(e) => updateEditingWorkExperience("current", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="current-work" className="text-sm font-normal">
                          Currently working here
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe your responsibilities, achievements, and key projects..."
                      value={editingWorkExperience.description}
                      onChange={(e) => updateEditingWorkExperience("description", e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* PDF Certificate Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <IconFileTypePdf className="h-4 w-4" />
                      Supporting Document (PDF)
                    </Label>
                    {editingWorkExperience.pdfUrl ? (
                      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <IconFileTypePdf className="h-8 w-8 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Certificate attached</p>
                          <p className="text-xs text-muted-foreground">PDF Document</p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="icon-sm" asChild>
                            <a href={editingWorkExperience.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <IconEye className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setEditingWorkExperience({ ...editingWorkExperience, pdfUrl: undefined })}
                          >
                            <IconTrash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePdfUpload(file, editingWorkExperience.id, 'work')
                            e.target.value = ''
                          }}
                          disabled={uploadingPdfId === editingWorkExperience.id}
                        />
                        <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                          {uploadingPdfId === editingWorkExperience.id ? (
                            <IconLoader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <IconUpload className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {uploadingPdfId === editingWorkExperience.id ? 'Uploading...' : 'Click or drag to upload certificate (PDF, max 5MB)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={cancelEditingWorkExperience}>
                      Cancel
                    </Button>
                    <Button onClick={saveWorkExperience} disabled={savingWorkExp}>
                      {savingWorkExp ? (
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <IconDeviceFloppy className="mr-2 h-4 w-4" />
                      )}
                      Save Experience
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GitHub Projects Tab */}
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconBrandGithub className="h-5 w-5" />
                    GitHub Projects
                    {selectedProjects.size > 0 && (
                      <Badge variant="default" className="ml-2">
                        {selectedProjects.size} selected
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Select the repositories you want to include in your CV
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {githubProjects.length > 0 && (
                    <>
                      <Button
                        onClick={selectedProjects.size === githubProjects.length ? deselectAllProjects : selectAllProjects}
                        size="sm"
                        variant="outline"
                      >
                        {selectedProjects.size === githubProjects.length ? "Deselect All" : "Select All"}
                      </Button>
                    </>
                  )}
                  <Button 
                    onClick={fetchGitHubProjects} 
                    size="sm" 
                    variant="outline"
                    disabled={loadingProjects}
                  >
                    {loadingProjects ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconRefresh className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                  <Button 
                    onClick={() => saveSection("selected_projects", Array.from(selectedProjects), setSavingProjects)} 
                    size="sm"
                    disabled={savingProjects}
                  >
                    {savingProjects ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProjects ? (
                <div className="text-center py-8">
                  <IconLoader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Fetching your GitHub projects...</p>
                </div>
              ) : projectsError ? (
                <div className="text-center py-8">
                  <IconBrandGithub className="h-12 w-12 mx-auto mb-4 opacity-50 text-destructive" />
                  <p className="text-destructive font-medium">{projectsError}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Make sure you have added your GitHub URL in your profile settings.
                  </p>
                  <Button 
                    onClick={fetchGitHubProjects} 
                    size="sm" 
                    variant="outline" 
                    className="mt-4"
                  >
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : githubProjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconBrandGithub className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No public repositories found</p>
                  <p className="text-sm">Your public GitHub repositories will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {githubProjects.map((project) => {
                    const isSelected = selectedProjects.has(project.id)
                    return (
                      <div 
                        key={project.id} 
                        onClick={() => toggleProjectSelection(project.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className={`mt-1 shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? "bg-primary border-primary" 
                              : "border-muted-foreground/30"
                          }`}>
                            {isSelected && <IconCheck className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold truncate">{project.name}</h4>
                              <a 
                                href={project.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                              {project.primaryLanguage && (
                                <Badge variant="secondary" className="text-xs">
                                  {project.primaryLanguage}
                                </Badge>
                              )}
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <IconStar className="h-4 w-4" />
                                {project.stars}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <IconGitFork className="h-4 w-4" />
                                {project.forks}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Updated {new Date(project.pushedAt).toLocaleDateString()}
                              </span>
                            </div>
                            {project.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {project.topics.slice(0, 5).map((topic) => (
                                  <Badge key={topic} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                                {project.topics.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{project.topics.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconCode className="h-5 w-5" />
                    Skills
                  </CardTitle>
                  <CardDescription>
                    Add your technical and soft skills with proficiency levels
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Skill Form */}
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Skill Name</Label>
                    <Input
                      placeholder="e.g., Python, React, Communication"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <Select
                      value={newSkillLevel}
                      onValueChange={(value) => setNewSkillLevel(value as Skill["level"])}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newSkillCategory}
                      onValueChange={(value) => setNewSkillCategory(value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={addSkill} size="sm" disabled={savingSkills || !newSkill.trim()}>
                  {savingSkills ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <IconPlus className="mr-2 h-4 w-4" />
                  )}
                  Add Skill
                </Button>
              </div>

              {/* Skills List by Category */}
              {savedSkills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No skills added yet</p>
                  <p className="text-sm">Add your skills using the form above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {skillCategories.map(category => {
                    const categorySkills = savedSkills.filter(s => s.category === category)
                    if (categorySkills.length === 0) return null
                    
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {categorySkills.map(skill => (
                            <Badge 
                              key={skill.id} 
                              variant="secondary"
                              className="flex items-center gap-2 py-1 px-3"
                            >
                              <span className={`w-2 h-2 rounded-full ${getSkillLevelColor(skill.level)}`} />
                              {skill.name}
                              <span className="text-xs text-muted-foreground">({skill.level})</span>
                              <button
                                onClick={() => removeSkill(skill.id)}
                                className="ml-1 hover:text-destructive"
                                disabled={savingSkills}
                              >
                                <IconX className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="mt-6 space-y-6">
          {/* Saved Certifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconCertificate className="h-5 w-5" />
                    Your Certifications
                  </CardTitle>
                  <CardDescription>
                    Your saved professional certifications and licenses
                  </CardDescription>
                </div>
                <Button onClick={startNewCertification} size="sm" disabled={editingCertification !== null}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Certification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedCertifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconCertificate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No certifications saved yet</p>
                  <p className="text-sm">Click "Add Certification" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedCertifications.map((cert) => (
                    <div key={cert.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{cert.name}</h4>
                          {cert.pdfUrl && (
                            <Badge variant="outline" className="text-xs">
                              <IconFileTypePdf className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                          {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                          {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                        </div>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1">
                            <IconExternalLink className="h-3 w-3" /> View Credential
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {cert.pdfUrl && (
                          <Button variant="outline" size="icon-sm" asChild>
                            <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <IconEye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => removeSavedCertification(cert.id)}
                          disabled={savingCerts}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editing Form */}
          {editingCertification && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Add New Certification</CardTitle>
                <CardDescription>Fill in the details for your certification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certification Name *</Label>
                    <Input
                      placeholder="e.g., AWS Solutions Architect"
                      value={editingCertification.name}
                      onChange={(e) => updateEditingCertification("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing Organization *</Label>
                    <Input
                      placeholder="e.g., Amazon Web Services"
                      value={editingCertification.issuer}
                      onChange={(e) => updateEditingCertification("issuer", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input
                      type="month"
                      value={editingCertification.issueDate}
                      onChange={(e) => updateEditingCertification("issueDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date (if applicable)</Label>
                    <Input
                      type="month"
                      value={editingCertification.expiryDate}
                      onChange={(e) => updateEditingCertification("expiryDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Credential ID</Label>
                    <Input
                      placeholder="e.g., ABC123XYZ"
                      value={editingCertification.credentialId}
                      onChange={(e) => updateEditingCertification("credentialId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credential URL</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={editingCertification.credentialUrl}
                      onChange={(e) => updateEditingCertification("credentialUrl", e.target.value)}
                    />
                  </div>
                </div>

                {/* PDF Certificate Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IconFileTypePdf className="h-4 w-4" />
                    Certificate PDF
                  </Label>
                  {editingCertification.pdfUrl ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <IconFileTypePdf className="h-8 w-8 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Certificate attached</p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon-sm" asChild>
                          <a href={editingCertification.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <IconEye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setEditingCertification({ ...editingCertification, pdfUrl: undefined })}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.type !== "application/pdf") {
                              toast.error("Please upload a PDF file only")
                              return
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size must be less than 5MB")
                              return
                            }
                            setUploadingPdfId(editingCertification.id)
                            try {
                              const formData = new FormData()
                              formData.append("file", file)
                              formData.append("type", "certification")
                              formData.append("itemId", editingCertification.id)
                              const response = await fetch("/api/upload-certificate", { method: "POST", body: formData })
                              if (!response.ok) throw new Error("Upload failed")
                              const data = await response.json()
                              setEditingCertification({ ...editingCertification, pdfUrl: data.url })
                              toast.success("Certificate uploaded!")
                            } catch (error) {
                              toast.error("Failed to upload certificate")
                            } finally {
                              setUploadingPdfId(null)
                            }
                          }
                          e.target.value = ''
                        }}
                        disabled={uploadingPdfId === editingCertification.id}
                      />
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        {uploadingPdfId === editingCertification.id ? (
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <IconUpload className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploadingPdfId === editingCertification.id ? 'Uploading...' : 'Click or drag to upload certificate (PDF, max 5MB)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={cancelEditingCertification}>
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={saveCertification} disabled={savingCerts}>
                    {savingCerts ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    )}
                    Save Certification
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Awards Tab */}
        <TabsContent value="awards" className="mt-6 space-y-6">
          {/* Saved Awards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconTrophy className="h-5 w-5" />
                    Your Awards & Achievements
                  </CardTitle>
                  <CardDescription>
                    Your saved awards, honors, and notable achievements
                  </CardDescription>
                </div>
                <Button onClick={startNewAward} size="sm" disabled={editingAward !== null}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Award
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedAwards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconTrophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No awards saved yet</p>
                  <p className="text-sm">Click "Add Award" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedAwards.map((award) => (
                    <div key={award.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{award.title}</h4>
                          {award.pdfUrl && (
                            <Badge variant="outline" className="text-xs">
                              <IconFileTypePdf className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          )}
                        </div>
                        {award.issuer && <p className="text-sm text-muted-foreground">{award.issuer}</p>}
                        {award.date && <p className="text-xs text-muted-foreground mt-1">{award.date}</p>}
                        {award.description && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{award.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        {award.pdfUrl && (
                          <Button variant="outline" size="icon-sm" asChild>
                            <a href={award.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <IconEye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => removeSavedAward(award.id)}
                          disabled={savingAwards}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editing Form */}
          {editingAward && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Add New Award</CardTitle>
                <CardDescription>Fill in the details for your award or achievement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Award Title *</Label>
                    <Input
                      placeholder="e.g., Best Project Award"
                      value={editingAward.title}
                      onChange={(e) => updateEditingAward("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing Organization</Label>
                    <Input
                      placeholder="e.g., College Technical Fest"
                      value={editingAward.issuer}
                      onChange={(e) => updateEditingAward("issuer", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Received</Label>
                  <Input
                    type="month"
                    value={editingAward.date}
                    onChange={(e) => updateEditingAward("date", e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what this award was for and its significance..."
                    value={editingAward.description}
                    onChange={(e) => updateEditingAward("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* PDF Certificate Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IconFileTypePdf className="h-4 w-4" />
                    Award Certificate (PDF)
                  </Label>
                  {editingAward.pdfUrl ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <IconFileTypePdf className="h-8 w-8 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Certificate attached</p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon-sm" asChild>
                          <a href={editingAward.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <IconEye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setEditingAward({ ...editingAward, pdfUrl: undefined })}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.type !== "application/pdf") {
                              toast.error("Please upload a PDF file only")
                              return
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size must be less than 5MB")
                              return
                            }
                            setUploadingPdfId(editingAward.id)
                            try {
                              const formData = new FormData()
                              formData.append("file", file)
                              formData.append("type", "award")
                              formData.append("itemId", editingAward.id)
                              const response = await fetch("/api/upload-certificate", { method: "POST", body: formData })
                              if (!response.ok) throw new Error("Upload failed")
                              const data = await response.json()
                              setEditingAward({ ...editingAward, pdfUrl: data.url })
                              toast.success("Certificate uploaded!")
                            } catch (error) {
                              toast.error("Failed to upload certificate")
                            } finally {
                              setUploadingPdfId(null)
                            }
                          }
                          e.target.value = ''
                        }}
                        disabled={uploadingPdfId === editingAward.id}
                      />
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        {uploadingPdfId === editingAward.id ? (
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <IconUpload className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploadingPdfId === editingAward.id ? 'Uploading...' : 'Click or drag to upload certificate (PDF, max 5MB)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={cancelEditingAward}>
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={saveAward} disabled={savingAwards}>
                    {savingAwards ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    )}
                    Save Award
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Extra Curricular Tab */}
        <TabsContent value="extra-curricular" className="mt-6 space-y-6">
          {/* Saved Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconActivity className="h-5 w-5" />
                    Your Activities
                  </CardTitle>
                  <CardDescription>
                    Your saved clubs, sports, volunteering, and other activities
                  </CardDescription>
                </div>
                <Button onClick={startNewExtraCurricular} size="sm" disabled={editingExtraCurricular !== null}>
                  <IconPlus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedExtraCurriculars.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <IconActivity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activities saved yet</p>
                  <p className="text-sm">Click "Add Activity" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedExtraCurriculars.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-4 border rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{activity.activity}</h4>
                          {activity.pdfUrl && (
                            <Badge variant="outline" className="text-xs">
                              <IconFileTypePdf className="h-3 w-3 mr-1" />
                              PDF
                            </Badge>
                          )}
                        </div>
                        {activity.organization && <p className="text-sm text-muted-foreground">{activity.organization}</p>}
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          {activity.role && <span>{activity.role}</span>}
                          {activity.startDate && (
                            <span>
                              {activity.startDate} - {activity.endDate || 'Present'}
                            </span>
                          )}
                        </div>
                        {activity.description && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{activity.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        {activity.pdfUrl && (
                          <Button variant="outline" size="icon-sm" asChild>
                            <a href={activity.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <IconEye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => removeSavedExtraCurricular(activity.id)}
                          disabled={savingActivities}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Editing Form */}
          {editingExtraCurricular && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-lg">Add New Activity</CardTitle>
                <CardDescription>Fill in the details for your extracurricular activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Activity Name *</Label>
                    <Input
                      placeholder="e.g., Debate Club, Basketball"
                      value={editingExtraCurricular.activity}
                      onChange={(e) => updateEditingExtraCurricular("activity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization/Institution</Label>
                    <Input
                      placeholder="e.g., University Sports Club"
                      value={editingExtraCurricular.organization}
                      onChange={(e) => updateEditingExtraCurricular("organization", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Role/Position</Label>
                    <Input
                      placeholder="e.g., Team Captain, Member"
                      value={editingExtraCurricular.role}
                      onChange={(e) => updateEditingExtraCurricular("role", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="month"
                      value={editingExtraCurricular.startDate}
                      onChange={(e) => updateEditingExtraCurricular("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="month"
                      value={editingExtraCurricular.endDate}
                      onChange={(e) => updateEditingExtraCurricular("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your involvement, achievements, and responsibilities..."
                    value={editingExtraCurricular.description}
                    onChange={(e) => updateEditingExtraCurricular("description", e.target.value)}
                    rows={3}
                  />
                </div>

                {/* PDF Certificate Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <IconFileTypePdf className="h-4 w-4" />
                    Supporting Document (PDF)
                  </Label>
                  {editingExtraCurricular.pdfUrl ? (
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <IconFileTypePdf className="h-8 w-8 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Document attached</p>
                        <p className="text-xs text-muted-foreground">PDF Document</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon-sm" asChild>
                          <a href={editingExtraCurricular.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <IconEye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setEditingExtraCurricular({ ...editingExtraCurricular, pdfUrl: undefined })}
                        >
                          <IconTrash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.type !== "application/pdf") {
                              toast.error("Please upload a PDF file only")
                              return
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error("File size must be less than 5MB")
                              return
                            }
                            setUploadingPdfId(editingExtraCurricular.id)
                            try {
                              const formData = new FormData()
                              formData.append("file", file)
                              formData.append("type", "activity")
                              formData.append("itemId", editingExtraCurricular.id)
                              const response = await fetch("/api/upload-certificate", { method: "POST", body: formData })
                              if (!response.ok) throw new Error("Upload failed")
                              const data = await response.json()
                              setEditingExtraCurricular({ ...editingExtraCurricular, pdfUrl: data.url })
                              toast.success("Document uploaded!")
                            } catch (error) {
                              toast.error("Failed to upload document")
                            } finally {
                              setUploadingPdfId(null)
                            }
                          }
                          e.target.value = ''
                        }}
                        disabled={uploadingPdfId === editingExtraCurricular.id}
                      />
                      <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                        {uploadingPdfId === editingExtraCurricular.id ? (
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <IconUpload className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {uploadingPdfId === editingExtraCurricular.id ? 'Uploading...' : 'Click or drag to upload document (PDF, max 5MB)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={cancelEditingExtraCurricular}>
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={saveExtraCurricular} disabled={savingActivities}>
                    {savingActivities ? (
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    )}
                    Save Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
