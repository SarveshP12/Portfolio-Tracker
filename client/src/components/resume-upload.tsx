"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  IconFileTypePdf,
  IconUpload,
  IconTrash,
  IconLoader2,
  IconDownload,
  IconEye,
} from "@tabler/icons-react"

interface ResumeUploadProps {
  currentResumeUrl?: string | null
  onUploadComplete: (url: string) => void
  onDelete?: () => void
}

export function ResumeUpload({
  currentResumeUrl,
  onUploadComplete,
  onDelete,
}: ResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      setUploadProgress(100)
      
      onUploadComplete(data.url)
      toast.success("Resume uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload resume")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async () => {
    if (!currentResumeUrl) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/upload-resume", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: currentResumeUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete resume")
      }

      onDelete?.()
      toast.success("Resume deleted successfully!")
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete resume")
    } finally {
      setIsDeleting(false)
    }
  }

  const getFileName = (url: string) => {
    try {
      const parts = url.split("/")
      return decodeURIComponent(parts[parts.length - 1])
    } catch {
      return "resume.pdf"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFileTypePdf className="h-5 w-5" />
          Resume / CV
        </CardTitle>
        <CardDescription>
          Upload your resume in PDF format (max 5MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentResumeUrl ? (
          // Show current resume
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <IconFileTypePdf className="h-10 w-10 text-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {getFileName(currentResumeUrl)}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF Document
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer">
                    <IconEye className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={currentResumeUrl} download>
                    <IconDownload className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconTrash className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want to upload a new resume?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <IconUpload className="mr-2 h-4 w-4" />
                Replace Resume
              </Button>
            </div>
          </div>
        ) : (
          // Upload area
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleChange}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <IconLoader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
                <div className="space-y-2">
                  <p className="font-medium">Uploading...</p>
                  <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
                </div>
              </div>
            ) : (
              <>
                <IconUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-1">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="mr-2 h-4 w-4" />
                  Select PDF File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Only PDF files up to 5MB are accepted
                </p>
              </>
            )}
          </div>
        )}

        {/* Hidden file input for replacement */}
        {currentResumeUrl && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="hidden"
          />
        )}
      </CardContent>
    </Card>
  )
}
