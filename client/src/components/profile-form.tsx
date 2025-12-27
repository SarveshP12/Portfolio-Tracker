"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  IconUser,
  IconSchool,
  IconBriefcase,
  IconCode,
  IconCertificate,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react"
import { ResumeUpload } from "@/components/resume-upload"

interface User {
  id: string
  clerk_id: string
  first_name: string | null
  last_name: string | null
  email: string
  avatar_url: string | null
  role: string
  organization_id: string | null
  phone?: string | null
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  college_name?: string | null
  department?: string | null
  batch_year?: string | null
  roll_number?: string | null
  cgpa?: number | null
  tenth_percentage?: number | null
  twelfth_percentage?: number | null
  backlogs?: number | null
  skills?: string[] | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  resume_url?: string | null
}

interface ProfileFormProps {
  user: User
}

const departments = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Data Science",
  "Artificial Intelligence",
  "Other",
]

const batchYears = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
]

export function ProfileForm({ user }: ProfileFormProps) {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [resumeUrl, setResumeUrl] = useState<string | null>(user.resume_url || null)
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
    date_of_birth: user.date_of_birth || "",
    gender: user.gender || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
    college_name: user.college_name || "",
    department: user.department || "",
    batch_year: user.batch_year || "",
    roll_number: user.roll_number || "",
    cgpa: user.cgpa?.toString() || "",
    tenth_percentage: user.tenth_percentage?.toString() || "",
    twelfth_percentage: user.twelfth_percentage?.toString() || "",
    backlogs: user.backlogs?.toString() || "0",
    skills: user.skills || [],
    linkedin_url: user.linkedin_url || "",
    github_url: user.github_url || "",
    portfolio_url: user.portfolio_url || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
          tenth_percentage: formData.tenth_percentage
            ? parseFloat(formData.tenth_percentage)
            : null,
          twelfth_percentage: formData.twelfth_percentage
            ? parseFloat(formData.twelfth_percentage)
            : null,
          backlogs: formData.backlogs ? parseInt(formData.backlogs) : 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = () => {
    const first = formData.first_name?.[0] || ""
    const last = formData.last_name?.[0] || ""
    return (first + last).toUpperCase() || "U"
  }

  // Prevent hydration mismatch by showing skeleton until mounted
  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar_url || ""} alt="Profile" />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold">
                {formData.first_name} {formData.last_name}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="mt-2">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Your basic personal details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Pincode"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSchool className="h-5 w-5" />
            Academic Information
          </CardTitle>
          <CardDescription>
            Your educational background and academic details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="college_name">College/University Name</Label>
            <Input
              id="college_name"
              name="college_name"
              value={formData.college_name}
              onChange={handleInputChange}
              placeholder="Enter your college name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department/Branch</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch_year">Batch Year</Label>
              <Select
                value={formData.batch_year}
                onValueChange={(value) => handleSelectChange("batch_year", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch year" />
                </SelectTrigger>
                <SelectContent>
                  {batchYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roll_number">Roll Number / Student ID</Label>
              <Input
                id="roll_number"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleInputChange}
                placeholder="Enter your roll number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">Current CGPA</Label>
              <Input
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleInputChange}
                placeholder="e.g., 8.5"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenth_percentage">10th Percentage</Label>
              <Input
                id="tenth_percentage"
                name="tenth_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.tenth_percentage}
                onChange={handleInputChange}
                placeholder="e.g., 85.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twelfth_percentage">12th Percentage</Label>
              <Input
                id="twelfth_percentage"
                name="twelfth_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.twelfth_percentage}
                onChange={handleInputChange}
                placeholder="e.g., 80.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlogs">Active Backlogs</Label>
              <Input
                id="backlogs"
                name="backlogs"
                type="number"
                min="0"
                value={formData.backlogs}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconCode className="h-5 w-5" />
            Skills & Technologies
          </CardTitle>
          <CardDescription>
            Add your technical and soft skills
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a skill and press Enter"
              className="flex-1"
            />
            <Button type="button" onClick={addSkill} variant="secondary">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSkill(skill)}
              >
                {skill} ×
              </Badge>
            ))}
            {formData.skills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No skills added yet. Add skills to improve job matching.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume Upload */}
      <ResumeUpload
        currentResumeUrl={resumeUrl}
        onUploadComplete={(url) => setResumeUrl(url)}
        onDelete={() => setResumeUrl(null)}
      />

      {/* Professional Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBriefcase className="h-5 w-5" />
            Professional Links
          </CardTitle>
          <CardDescription>
            Add links to your professional profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
            <Input
              id="linkedin_url"
              name="linkedin_url"
              type="url"
              value={formData.linkedin_url}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub Profile</Label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              value={formData.github_url}
              onChange={handleInputChange}
              placeholder="https://github.com/yourusername"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="portfolio_url">Portfolio Website</Label>
            <Input
              id="portfolio_url"
              name="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
