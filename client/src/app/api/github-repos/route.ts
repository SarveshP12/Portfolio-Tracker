import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  fork: boolean
  archived: boolean
  private: boolean
}

interface ProcessedRepo {
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
  isFork: boolean
  isArchived: boolean
}

function extractGitHubUsername(githubUrl: string): string | null {
  if (!githubUrl) return null
  
  // Handle various GitHub URL formats
  // https://github.com/username
  // https://github.com/username/
  // github.com/username
  // @username
  // username
  
  try {
    // Remove trailing slashes and whitespace
    const cleanUrl = githubUrl.trim().replace(/\/+$/, "")
    
    // If it's just a username
    if (!cleanUrl.includes("/") && !cleanUrl.includes(".")) {
      return cleanUrl.replace("@", "")
    }
    
    // If it starts with @
    if (cleanUrl.startsWith("@")) {
      return cleanUrl.slice(1)
    }
    
    // Try to parse as URL
    let urlToParse = cleanUrl
    if (!cleanUrl.startsWith("http")) {
      urlToParse = "https://" + cleanUrl
    }
    
    const url = new URL(urlToParse)
    const pathParts = url.pathname.split("/").filter(Boolean)
    
    if (pathParts.length > 0) {
      return pathParts[0]
    }
    
    return null
  } catch {
    // If URL parsing fails, try to extract from the string
    const match = githubUrl.match(/github\.com\/([^\/\s]+)/)
    return match ? match[1] : null
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    console.log("GitHub repos API - userId:", userId)
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single()

    console.log("GitHub repos API - userData:", userData, "error:", userError)

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found in database. Please refresh the page." },
        { status: 404 }
      )
    }

    // Get student data with github_url
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from("students")
      .select("github_url")
      .eq("user_id", userData.id)
      .single()

    console.log("GitHub repos API - studentData:", studentData, "error:", studentError)

    if (studentError) {
      console.error("Student query error:", studentError)
      return NextResponse.json(
        { error: "Student profile not found. Please complete your profile first." },
        { status: 404 }
      )
    }

    if (!studentData || !studentData.github_url) {
      return NextResponse.json(
        { error: "GitHub URL not found in profile. Please add your GitHub URL in your profile settings." },
        { status: 400 }
      )
    }

    const username = extractGitHubUsername(studentData.github_url)
    console.log("GitHub repos API - extracted username:", username, "from URL:", studentData.github_url)
    
    if (!username) {
      return NextResponse.json(
        { error: "Invalid GitHub URL format. Please update your GitHub URL in profile settings." },
        { status: 400 }
      )
    }

    // Fetch repositories from GitHub API
    const githubApiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=owner`
    console.log("GitHub repos API - fetching from:", githubApiUrl)
    
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "JobPred-CV-Builder",
    }

    // Add GitHub token if available for higher rate limits
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    const githubResponse = await fetch(githubApiUrl, { headers })

    if (!githubResponse.ok) {
      if (githubResponse.status === 404) {
        return NextResponse.json(
          { error: `GitHub user "${username}" not found. Please check your GitHub URL.` },
          { status: 404 }
        )
      }
      if (githubResponse.status === 403) {
        return NextResponse.json(
          { error: "GitHub API rate limit exceeded. Please try again later." },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: "Failed to fetch repositories from GitHub." },
        { status: 500 }
      )
    }

    const repos: GitHubRepo[] = await githubResponse.json()

    // Process and filter repositories
    const processedRepos: ProcessedRepo[] = repos
      .filter(repo => !repo.fork && !repo.archived && !repo.private) // Exclude forks, archived, and private repos
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        primaryLanguage: repo.language,
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        homepage: repo.homepage,
        isFork: repo.fork,
        isArchived: repo.archived,
      }))
      .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())

    return NextResponse.json({
      username,
      githubUrl: studentData.github_url,
      repositories: processedRepos,
      totalCount: processedRepos.length,
    })
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Fetch README content for a specific repository
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { owner, repo } = body

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      )
    }

    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3.raw",
      "User-Agent": "JobPred-CV-Builder",
    }

    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`
    }

    // Try to fetch README
    const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`
    const readmeResponse = await fetch(readmeUrl, { headers })

    let readmeContent = ""
    if (readmeResponse.ok) {
      readmeContent = await readmeResponse.text()
      // Truncate if too long (keep first 2000 chars)
      if (readmeContent.length > 2000) {
        readmeContent = readmeContent.substring(0, 2000) + "..."
      }
    }

    // Fetch languages used in the repo
    const languagesUrl = `https://api.github.com/repos/${owner}/${repo}/languages`
    const languagesResponse = await fetch(languagesUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "JobPred-CV-Builder",
        ...(process.env.GITHUB_TOKEN && { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }),
      },
    })

    let languages: Record<string, number> = {}
    if (languagesResponse.ok) {
      languages = await languagesResponse.json()
    }

    // Fetch topics
    const topicsUrl = `https://api.github.com/repos/${owner}/${repo}/topics`
    const topicsResponse = await fetch(topicsUrl, {
      headers: {
        "Accept": "application/vnd.github.mercy-preview+json",
        "User-Agent": "JobPred-CV-Builder",
        ...(process.env.GITHUB_TOKEN && { "Authorization": `Bearer ${process.env.GITHUB_TOKEN}` }),
      },
    })

    let topics: string[] = []
    if (topicsResponse.ok) {
      const topicsData = await topicsResponse.json()
      topics = topicsData.names || []
    }

    return NextResponse.json({
      readme: readmeContent,
      languages: Object.keys(languages),
      topics,
    })
  } catch (error) {
    console.error("Error fetching repo details:", error)
    return NextResponse.json(
      { error: "Failed to fetch repository details" },
      { status: 500 }
    )
  }
}
