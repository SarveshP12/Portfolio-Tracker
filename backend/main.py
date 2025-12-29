"""
JobPred Backend API
FastAPI server for CV generation and GitHub analysis
"""

import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from app.github_analyzer import GitHubAnalyzer, get_analyzer
from app.latex_generator import LaTeXCVGenerator, get_generator

# Initialize FastAPI app
app = FastAPI(
    title="JobPred CV Generator API",
    description="API for generating professional LaTeX CVs with NLP-powered GitHub analysis",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models
class SkillData(BaseModel):
    id: Optional[str] = None
    name: str
    level: Optional[str] = "Intermediate"
    category: Optional[str] = "Technical"


class WorkExperienceData(BaseModel):
    id: Optional[str] = None
    company: str
    position: str
    location: Optional[str] = ""
    start_date: Optional[str] = Field(None, alias="startDate")
    end_date: Optional[str] = Field(None, alias="endDate")
    is_current: Optional[bool] = Field(False, alias="current")
    description: Optional[str] = ""
    
    class Config:
        populate_by_name = True


class CertificationData(BaseModel):
    id: Optional[str] = None
    name: str
    issuer: Optional[str] = ""
    issue_date: Optional[str] = Field(None, alias="issueDate")
    expiry_date: Optional[str] = Field(None, alias="expiryDate")
    credential_id: Optional[str] = Field("", alias="credentialId")
    credential_url: Optional[str] = Field("", alias="credentialUrl")
    
    class Config:
        populate_by_name = True


class AwardData(BaseModel):
    id: Optional[str] = None
    title: str
    issuer: Optional[str] = ""
    date: Optional[str] = ""
    description: Optional[str] = ""


class ExtraCurricularData(BaseModel):
    id: Optional[str] = None
    activity: str
    organization: Optional[str] = ""
    role: Optional[str] = ""
    start_date: Optional[str] = Field(None, alias="startDate")
    end_date: Optional[str] = Field(None, alias="endDate")
    description: Optional[str] = ""
    
    class Config:
        populate_by_name = True


class ProfileData(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    date_of_birth: Optional[str] = ""
    gender: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    state: Optional[str] = ""
    pincode: Optional[str] = ""
    college_name: Optional[str] = ""
    department: Optional[str] = ""
    batch_year: Optional[str] = ""
    roll_number: Optional[str] = ""
    cgpa: Optional[float] = None
    tenth_percentage: Optional[float] = None
    twelfth_percentage: Optional[float] = None
    backlogs: Optional[int] = None
    skills: Optional[List[str]] = []
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    portfolio_url: Optional[str] = ""


class GitHubProjectData(BaseModel):
    id: int
    name: str
    full_name: Optional[str] = ""
    url: Optional[str] = ""
    original_description: Optional[str] = ""
    generated_description: Optional[str] = ""
    languages: Optional[List[str]] = []
    topics: Optional[List[str]] = []
    stars: Optional[int] = 0
    primary_language: Optional[str] = ""
    created_at: Optional[str] = ""
    updated_at: Optional[str] = ""


class CVGenerationRequest(BaseModel):
    profile: ProfileData
    skills: Optional[List[SkillData]] = []
    work_experiences: Optional[List[WorkExperienceData]] = Field([], alias="workExperiences")
    certifications: Optional[List[CertificationData]] = []
    awards: Optional[List[AwardData]] = []
    extra_curriculars: Optional[List[ExtraCurricularData]] = Field([], alias="extraCurriculars")
    selected_project_ids: Optional[List[int]] = Field([], alias="selectedProjectIds")
    github_projects: Optional[List[GitHubProjectData]] = Field([], alias="githubProjects")
    
    class Config:
        populate_by_name = True


class CVGenerationResponse(BaseModel):
    latex_code: str
    message: str
    analyzed_projects: Optional[List[Dict]] = []


class GitHubAnalysisRequest(BaseModel):
    github_url: str
    repo_ids: Optional[List[int]] = []


class GitHubAnalysisResponse(BaseModel):
    repositories: List[Dict]
    message: str


# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "JobPred CV Generator API"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/api/analyze-github", response_model=GitHubAnalysisResponse)
async def analyze_github_repos(request: GitHubAnalysisRequest):
    """
    Analyze GitHub repositories and generate NLP-powered descriptions
    """
    try:
        analyzer = get_analyzer(os.getenv("GITHUB_TOKEN"))
        
        if not request.github_url:
            raise HTTPException(status_code=400, detail="GitHub URL is required")
        
        # Analyze repositories
        results = analyzer.analyze_repositories(
            github_url=request.github_url,
            repo_ids=request.repo_ids if request.repo_ids else None
        )
        
        return GitHubAnalysisResponse(
            repositories=results,
            message=f"Successfully analyzed {len(results)} repositories"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing repositories: {str(e)}")


@app.post("/api/generate-cv", response_model=CVGenerationResponse)
async def generate_cv(request: CVGenerationRequest):
    """
    Generate LaTeX CV from provided data
    """
    try:
        generator = get_generator()
        analyzer = get_analyzer(os.getenv("GITHUB_TOKEN"))
        
        # Convert Pydantic models to dicts
        profile_dict = request.profile.model_dump()
        skills_list = [s.model_dump() for s in (request.skills or [])]
        work_exp_list = [w.model_dump() for w in (request.work_experiences or [])]
        certs_list = [c.model_dump() for c in (request.certifications or [])]
        awards_list = [a.model_dump() for a in (request.awards or [])]
        extra_curr_list = [e.model_dump() for e in (request.extra_curriculars or [])]
        
        # Analyze GitHub projects if URL provided and projects selected
        analyzed_projects = []
        if request.github_projects:
            analyzed_projects = [p.model_dump() for p in request.github_projects]
        elif request.selected_project_ids and profile_dict.get("github_url"):
            # Analyze selected repositories
            analyzed_projects = analyzer.analyze_repositories(
                github_url=profile_dict["github_url"],
                repo_ids=request.selected_project_ids
            )
        
        # Generate LaTeX
        latex_code = generator.generate_cv(
            profile=profile_dict,
            skills=skills_list,
            work_experiences=work_exp_list,
            certifications=certs_list,
            awards=awards_list,
            extra_curriculars=extra_curr_list,
            github_projects=analyzed_projects,
        )
        
        return CVGenerationResponse(
            latex_code=latex_code,
            message="CV generated successfully",
            analyzed_projects=analyzed_projects
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating CV: {str(e)}")


@app.get("/api/analyze-repo/{owner}/{repo}")
async def analyze_single_repo(owner: str, repo: str):
    """
    Analyze a single GitHub repository
    """
    try:
        analyzer = get_analyzer(os.getenv("GITHUB_TOKEN"))
        
        repo_details = analyzer.fetch_repository_details(owner, repo)
        
        if not repo_details:
            raise HTTPException(status_code=404, detail="Repository not found")
        
        description = analyzer.generate_project_description(repo_details)
        
        return {
            "repository": repo_details,
            "generated_description": description,
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing repository: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )
