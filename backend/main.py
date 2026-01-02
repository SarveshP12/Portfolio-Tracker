"""
JobPred Backend API
FastAPI server for CV generation and GitHub analysis
"""

import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import tempfile
from PyPDF2 import PdfReader

# Load environment variables
load_dotenv()

# Import our modules
from app.github_analyzer import GitHubAnalyzer, get_analyzer
from app.latex_generator import LaTeXCVGenerator, get_generator
from app.ats_analyzer import ATSAnalyzer, get_ats_analyzer
from app.job_scraper import JobScraperManager, get_job_scraper_manager, JobMatcher

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


# ATS Analysis Models
class ATSAnalysisRequest(BaseModel):
    resume_text: str = Field(..., description="The full text content of the resume")
    job_description: str = Field(..., description="The full text content of the job description")


class ATSAnalysisResponse(BaseModel):
    overall_score: float
    category: str
    category_description: str
    breakdown: Dict[str, Any]
    extracted_data: Dict[str, Any]
    recommendations: List[Dict[str, str]]
    extracted_info: Optional[Dict[str, Any]] = None


@app.post("/api/ats-check", response_model=ATSAnalysisResponse)
async def analyze_ats_compatibility(request: ATSAnalysisRequest):
    """
    Analyze resume against job description for ATS compatibility
    
    This endpoint performs comprehensive ATS analysis including:
    - Keyword matching with synonym normalization
    - Experience level matching
    - Format compliance checking
    - Semantic similarity analysis
    
    Returns a score from 0-100 with detailed breakdown and recommendations.
    """
    try:
        if not request.resume_text or not request.job_description:
            raise HTTPException(
                status_code=400, 
                detail="Both resume_text and job_description are required"
            )
        
        if len(request.resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Resume text is too short for meaningful analysis"
            )
        
        if len(request.job_description.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Job description is too short for meaningful analysis"
            )
        
        analyzer = get_ats_analyzer()
        result = analyzer.analyze(
            resume_text=request.resume_text,
            job_description=request.job_description
        )
        
        return ATSAnalysisResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error analyzing ATS compatibility: {str(e)}"
        )


@app.post("/api/ats-check-pdf", response_model=ATSAnalysisResponse)
async def analyze_ats_compatibility_pdf(
    resume_pdf: UploadFile = File(..., description="Resume PDF file"),
    job_description: str = Form(..., description="Job description text")
):
    """
    Analyze resume PDF against job description for ATS compatibility
    
    This endpoint accepts a PDF file upload and job description text,
    extracts text from the PDF using PyPDF2, then performs the same
    comprehensive ATS analysis as the text-based endpoint.
    """
    try:
        # Validate file type
        if not resume_pdf.filename or not resume_pdf.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF files are supported"
            )
        
        if not job_description or len(job_description.strip()) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Job description is required and must be at least 50 characters"
            )
        
        # Read PDF file and save to temporary location
        pdf_content = await resume_pdf.read()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_content)
            tmp_file_path = tmp_file.name
        
        try:
            # Extract text from PDF
            reader = PdfReader(tmp_file_path)
            extracted_text = ""
            
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
            
            # Clean up the extracted text
            extracted_text = extracted_text.strip()
            
            if not extracted_text or len(extracted_text) < 50:
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract sufficient text from PDF. Please ensure the PDF contains readable text (not just images)."
                )
            
            # Analyze using the same ATS logic
            analyzer = get_ats_analyzer()
            result = analyzer.analyze(
                resume_text=extracted_text,
                job_description=job_description
            )
            
            # Add extracted text length info to the response
            result["extracted_info"] = {
                "text_length": len(extracted_text),
                "word_count": len(extracted_text.split()),
                "page_count": len(reader.pages),
                "filename": resume_pdf.filename
            }
            
            return ATSAnalysisResponse(**result)
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_file_path)
            except OSError:
                pass  # File may already be deleted
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing PDF and analyzing ATS compatibility: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )


# Job Finder Models and Endpoints
class JobSearchRequest(BaseModel):
    resume_text: Optional[str] = Field(None, description="Full text content of the resume")
    resume_skills: Optional[List[str]] = Field(None, description="List of skills from the resume")
    keywords: Optional[List[str]] = Field(None, description="Search keywords (if not provided, extracted from resume)")
    location: Optional[str] = Field("India", description="Preferred job location")
    job_type: Optional[str] = Field("", description="Job type: internship, full-time, etc.")
    platforms: Optional[List[str]] = Field(None, description="Platforms to search: linkedin, internshala, foundit, naukri, indeed")


class JobListingResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    job_type: str
    experience_required: str
    salary: str
    description: str
    skills_required: List[str]
    posted_date: str
    apply_url: str
    source: str
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]


class JobSearchResponse(BaseModel):
    jobs: List[JobListingResponse]
    total_found: int
    search_keywords: List[str]
    extracted_resume_skills: List[str]
    platforms_searched: List[str]
    message: str


class SkillExtractionRequest(BaseModel):
    resume_text: str = Field(..., description="Full text content of the resume")


class SkillExtractionResponse(BaseModel):
    skills: List[str]
    experience_years: int
    message: str


@app.post("/api/job-finder/search", response_model=JobSearchResponse)
async def search_jobs(request: JobSearchRequest):
    """
    Search for jobs/internships across multiple platforms and match with resume
    
    This endpoint:
    1. Extracts skills from the resume text
    2. Searches multiple job platforms (LinkedIn, Internshala, Foundit, Naukri, Indeed)
    3. Matches and ranks jobs based on resume skills and preferences
    4. Returns sorted results with match scores
    """
    try:
        if not request.resume_text and not request.keywords:
            raise HTTPException(
                status_code=400,
                detail="Either resume_text or keywords must be provided"
            )
        
        # Get the job scraper manager
        scraper_manager = get_job_scraper_manager(headless=True)
        
        # Perform search and matching
        result = scraper_manager.search_and_match(
            resume_text=request.resume_text or "",
            resume_skills=request.resume_skills,
            keywords=request.keywords,
            location=request.location or "India",
            job_type=request.job_type or "",
            platforms=request.platforms
        )
        
        return JobSearchResponse(
            jobs=result["jobs"],
            total_found=result["total_found"],
            search_keywords=result["search_keywords"],
            extracted_resume_skills=result["extracted_resume_skills"],
            platforms_searched=result["platforms_searched"],
            message=f"Found {result['total_found']} jobs matching your profile"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching for jobs: {str(e)}"
        )


@app.post("/api/job-finder/search-pdf", response_model=JobSearchResponse)
async def search_jobs_with_pdf(
    resume_pdf: UploadFile = File(..., description="Resume PDF file"),
    keywords: str = Form(None, description="Comma-separated search keywords"),
    location: str = Form("India", description="Preferred job location"),
    job_type: str = Form("", description="Job type: internship, full-time, etc."),
    platforms: str = Form(None, description="Comma-separated platforms to search")
):
    """
    Search for jobs using a PDF resume
    
    Accepts a resume PDF file, extracts text, and searches for matching jobs.
    """
    try:
        # Validate file type
        if not resume_pdf.filename or not resume_pdf.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported"
            )
        
        # Read PDF file
        pdf_content = await resume_pdf.read()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_content)
            tmp_file_path = tmp_file.name
        
        try:
            # Extract text from PDF
            reader = PdfReader(tmp_file_path)
            extracted_text = ""
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    extracted_text += page_text + "\n"
            
            extracted_text = extracted_text.strip()
            
            if not extracted_text or len(extracted_text) < 50:
                raise HTTPException(
                    status_code=400,
                    detail="Could not extract sufficient text from PDF"
                )
            
            # Parse form inputs
            keywords_list = [k.strip() for k in keywords.split(",")] if keywords else None
            platforms_list = [p.strip() for p in platforms.split(",")] if platforms else None
            
            # Get the job scraper manager
            scraper_manager = get_job_scraper_manager(headless=True)
            
            # Perform search and matching
            result = scraper_manager.search_and_match(
                resume_text=extracted_text,
                resume_skills=None,
                keywords=keywords_list,
                location=location,
                job_type=job_type,
                platforms=platforms_list
            )
            
            return JobSearchResponse(
                jobs=result["jobs"],
                total_found=result["total_found"],
                search_keywords=result["search_keywords"],
                extracted_resume_skills=result["extracted_resume_skills"],
                platforms_searched=result["platforms_searched"],
                message=f"Found {result['total_found']} jobs matching your profile"
            )
        
        finally:
            try:
                os.unlink(tmp_file_path)
            except OSError:
                pass
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing PDF and searching for jobs: {str(e)}"
        )


@app.post("/api/job-finder/extract-skills", response_model=SkillExtractionResponse)
async def extract_resume_skills(request: SkillExtractionRequest):
    """
    Extract skills and experience from resume text
    
    Useful for previewing what skills will be matched before searching.
    """
    try:
        if not request.resume_text or len(request.resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Resume text is too short"
            )
        
        matcher = JobMatcher()
        skills = matcher.extract_skills_from_resume(request.resume_text)
        experience = matcher.extract_experience_years(request.resume_text)
        
        return SkillExtractionResponse(
            skills=skills,
            experience_years=experience,
            message=f"Extracted {len(skills)} skills from resume"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting skills: {str(e)}"
        )


@app.get("/api/job-finder/platforms")
async def get_available_platforms():
    """
    Get list of available job platforms
    """
    return {
        "platforms": [
            {"id": "linkedin", "name": "LinkedIn", "description": "Professional network with job listings"},
            {"id": "internshala", "name": "Internshala", "description": "India's largest internship platform"},
            {"id": "foundit", "name": "Foundit", "description": "Monster India rebranded as Foundit"},
            {"id": "naukri", "name": "Naukri", "description": "India's leading job portal"},
            {"id": "indeed", "name": "Indeed", "description": "Global job search engine"},
        ]
    }