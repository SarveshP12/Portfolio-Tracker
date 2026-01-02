"""
Test script for job scraper functionality
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.job_scraper import (
    JobMatcher,
    JobScraperManager,
    LinkedInScraper,
    InternshalaScaper,
    get_job_scraper_manager
)

def test_skill_extraction():
    """Test skill extraction from resume text"""
    print("=" * 50)
    print("Testing Skill Extraction")
    print("=" * 50)
    
    matcher = JobMatcher()
    
    sample_resume = """
    John Doe
    Software Developer
    
    Skills:
    - Python, JavaScript, TypeScript
    - React, Node.js, Django, Flask
    - MySQL, PostgreSQL, MongoDB
    - AWS, Docker, Kubernetes
    - Machine Learning, TensorFlow, PyTorch
    - Git, GitHub, CI/CD
    
    Experience:
    - 2 years of experience in software development
    - Built scalable web applications using React and Node.js
    - Implemented machine learning models using TensorFlow
    
    Education:
    B.Tech in Computer Science
    """
    
    skills = matcher.extract_skills_from_resume(sample_resume)
    experience = matcher.extract_experience_years(sample_resume)
    
    print(f"Extracted Skills: {skills}")
    print(f"Experience Years: {experience}")
    print()
    
    return skills

def test_job_matching():
    """Test job matching logic"""
    print("=" * 50)
    print("Testing Job Matching")
    print("=" * 50)
    
    from app.job_scraper import JobListing
    
    matcher = JobMatcher()
    
    # Sample resume
    resume_text = """
    Software Engineer with 2 years of experience in Python, React, and Node.js.
    Skills: Python, JavaScript, React, Django, PostgreSQL, AWS, Git
    """
    
    resume_skills = ["python", "javascript", "react", "django", "postgresql", "aws", "git"]
    
    # Sample jobs
    jobs = [
        JobListing(
            id="job1",
            title="Python Developer",
            company="Tech Corp",
            location="Bangalore",
            job_type="Full-time",
            experience_required="2-3 years",
            salary="10-15 LPA",
            description="Looking for Python developer with Django and PostgreSQL experience",
            skills_required=["python", "django", "postgresql", "aws"],
            posted_date="Today",
            apply_url="https://example.com/job1",
            source="linkedin"
        ),
        JobListing(
            id="job2",
            title="Frontend Developer",
            company="Startup Inc",
            location="Remote",
            job_type="Full-time",
            experience_required="1-2 years",
            salary="8-12 LPA",
            description="React developer needed with TypeScript experience",
            skills_required=["react", "typescript", "css", "graphql"],
            posted_date="2 days ago",
            apply_url="https://example.com/job2",
            source="internshala"
        ),
        JobListing(
            id="job3",
            title="Data Scientist",
            company="AI Labs",
            location="Mumbai",
            job_type="Full-time",
            experience_required="3-5 years",
            salary="15-25 LPA",
            description="ML Engineer with TensorFlow and PyTorch experience",
            skills_required=["python", "machine learning", "tensorflow", "pytorch", "sql"],
            posted_date="1 week ago",
            apply_url="https://example.com/job3",
            source="naukri"
        ),
    ]
    
    matched_jobs = matcher.match_jobs(jobs, resume_text, resume_skills, "Bangalore")
    
    print("Matched Jobs (sorted by score):")
    for job in matched_jobs:
        print(f"\n  {job.title} at {job.company}")
        print(f"    Match Score: {job.match_score}%")
        print(f"    Matched Skills: {job.matched_skills}")
        print(f"    Missing Skills: {job.missing_skills}")
    
    print()
    return matched_jobs

def test_scraper_initialization():
    """Test that scrapers can be initialized"""
    print("=" * 50)
    print("Testing Scraper Initialization")
    print("=" * 50)
    
    try:
        manager = get_job_scraper_manager(headless=True)
        print(f"Available scrapers: {list(manager.scrapers.keys())}")
        print("Scraper manager initialized successfully!")
    except Exception as e:
        print(f"Error initializing scraper manager: {e}")
    
    print()

def test_live_scraping(skip=True):
    """Test live scraping (disabled by default to avoid long waits)"""
    if skip:
        print("=" * 50)
        print("Skipping Live Scraping Test (set skip=False to enable)")
        print("=" * 50)
        return
    
    print("=" * 50)
    print("Testing Live Scraping (Internshala only)")
    print("=" * 50)
    
    try:
        scraper = InternshalaScaper(headless=True)
        jobs = scraper.search_jobs(
            keywords=["python", "django"],
            location="bangalore",
            job_type="internship"
        )
        
        print(f"Found {len(jobs)} jobs on Internshala")
        for job in jobs[:3]:
            print(f"\n  {job.title} at {job.company}")
            print(f"    Location: {job.location}")
            print(f"    Type: {job.job_type}")
            
    except Exception as e:
        print(f"Error during live scraping: {e}")
    
    print()

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("       JOB SCRAPER TEST SUITE")
    print("=" * 60 + "\n")
    
    test_skill_extraction()
    test_job_matching()
    test_scraper_initialization()
    test_live_scraping(skip=True)  # Set to False to test live scraping
    
    print("=" * 60)
    print("       ALL TESTS COMPLETED")
    print("=" * 60)
