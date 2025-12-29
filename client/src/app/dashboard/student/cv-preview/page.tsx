"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  IconArrowLeft,
  IconDownload,
  IconCopy,
  IconFileCode,
  IconEye,
  IconExternalLink,
  IconBrandGithub,
} from "@tabler/icons-react"

interface AnalyzedProject {
  id: number
  name: string
  full_name: string
  url: string
  original_description: string
  generated_description: string
  languages: string[]
  topics: string[]
  stars: number
  primary_language: string
}

export default function CVPreviewPage() {
  const router = useRouter()
  const [latexCode, setLatexCode] = useState<string>("")
  const [analyzedProjects, setAnalyzedProjects] = useState<AnalyzedProject[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Load from localStorage
    const storedLatex = localStorage.getItem("generatedLatexCV")
    const storedProjects = localStorage.getItem("analyzedProjects")
    
    if (storedLatex) {
      setLatexCode(storedLatex)
    }
    
    if (storedProjects) {
      try {
        setAnalyzedProjects(JSON.parse(storedProjects))
      } catch (e) {
        console.error("Error parsing analyzed projects:", e)
      }
    }
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latexCode)
      setCopied(true)
      toast.success("LaTeX code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadLatex = () => {
    if (!latexCode) {
      toast.error("No LaTeX code to download")
      return
    }
    
    const blob = new Blob([latexCode], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Resume.tex"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("LaTeX file downloaded!")
  }

  const openInOverleaf = () => {
    // Encode the LaTeX code for URL
    const encoded = encodeURIComponent(latexCode)
    const overleafUrl = `https://www.overleaf.com/docs?snip_uri=data:text/plain;charset=utf-8,${encoded}`
    window.open(overleafUrl, "_blank")
  }

  if (!latexCode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <IconFileCode className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No CV Generated Yet</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please go to the CV Builder and click "Generate CV" to create your professional resume.
        </p>
        <Button onClick={() => router.push("/dashboard/student/cv-builder")}>
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Go to CV Builder
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <IconArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight">CV Preview</h1>
              <p className="text-muted-foreground">
                Your generated LaTeX CV is ready
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard}>
              <IconCopy className="mr-2 h-4 w-4" />
              {copied ? "Copied!" : "Copy Code"}
            </Button>
            <Button variant="outline" onClick={downloadLatex}>
              <IconDownload className="mr-2 h-4 w-4" />
              Download .tex
            </Button>
            <Button onClick={openInOverleaf} className="bg-green-600 hover:bg-green-700">
              <IconExternalLink className="mr-2 h-4 w-4" />
              Open in Overleaf
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="latex" className="w-full">
          <TabsList>
            <TabsTrigger value="latex" className="flex items-center gap-2">
              <IconFileCode className="h-4 w-4" />
              LaTeX Code
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <IconBrandGithub className="h-4 w-4" />
              Analyzed Projects ({analyzedProjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="latex" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileCode className="h-5 w-5" />
                  Generated LaTeX Code
                </CardTitle>
                <CardDescription>
                  Copy this code and paste it into Overleaf or any LaTeX editor to compile your CV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] text-sm font-mono">
                    <code>{latexCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Instructions Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How to Compile Your CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Option 1: Overleaf (Recommended)</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Click the "Open in Overleaf" button above</li>
                    <li>Sign in to your Overleaf account (or create one for free)</li>
                    <li>Click "Compile" to generate your PDF</li>
                    <li>Download the PDF from Overleaf</li>
                  </ol>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Option 2: Local LaTeX Installation</h4>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Download the .tex file using the button above</li>
                    <li>Open the file in your LaTeX editor (TeXstudio, VS Code with LaTeX Workshop, etc.)</li>
                    <li>Compile with pdflatex or xelatex</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBrandGithub className="h-5 w-5" />
                  NLP-Analyzed GitHub Projects
                </CardTitle>
                <CardDescription>
                  These project descriptions were generated using NLP analysis of your GitHub repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyzedProjects.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No GitHub projects were analyzed. Select projects in the CV Builder to include them in your CV.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {analyzedProjects.map((project) => (
                      <div key={project.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{project.name}</h4>
                            <a 
                              href={project.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {project.full_name}
                              <IconExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          {project.primary_language && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {project.primary_language}
                            </span>
                          )}
                        </div>
                        
                        {project.original_description && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original Description:</p>
                            <p className="text-sm">{project.original_description}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">AI-Generated Description:</p>
                          <p className="text-sm bg-green-50 p-2 rounded border border-green-200">
                            {project.generated_description}
                          </p>
                        </div>
                        
                        {project.languages && project.languages.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.languages.map((lang) => (
                              <span key={lang} className="px-2 py-0.5 text-xs rounded bg-muted">
                                {lang}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
