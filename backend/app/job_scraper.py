"""
Job Scraper Module - Selenium-based job scraping from multiple platforms
Supports: LinkedIn, Foundit, Internshala, Naukri, Indeed, Glassdoor
"""

import os
import re
import time
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import hashlib

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class JobListing:
    """Data class for job listings"""
    id: str
    title: str
    company: str
    location: str
    job_type: str  # Full-time, Part-time, Internship, Contract
    experience_required: str
    salary: str
    description: str
    skills_required: List[str]
    posted_date: str
    apply_url: str
    source: str  # linkedin, foundit, internshala, naukri, indeed
    match_score: float = 0.0
    matched_skills: List[str] = None
    missing_skills: List[str] = None
    
    def __post_init__(self):
        if self.matched_skills is None:
            self.matched_skills = []
        if self.missing_skills is None:
            self.missing_skills = []
    
    def to_dict(self) -> Dict:
        return asdict(self)


class JobScraperBase:
    """Base class for all job scrapers"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver = None
        self.wait = None
    
    def setup_driver(self):
        """Set up Chrome WebDriver with options"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless=new")
        
        # Common options for stability
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-infobars")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Set user agent to avoid detection
        chrome_options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
                "source": """
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    })
                """
            })
            self.wait = WebDriverWait(self.driver, 15)
            logger.info(f"WebDriver initialized for {self.__class__.__name__}")
        except WebDriverException as e:
            logger.error(f"Failed to initialize WebDriver: {e}")
            raise
    
    def close_driver(self):
        """Close the WebDriver"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.error(f"Error closing driver: {e}")
    
    def generate_job_id(self, title: str, company: str, source: str) -> str:
        """Generate a unique job ID"""
        unique_string = f"{title}_{company}_{source}_{datetime.now().strftime('%Y%m%d')}"
        return hashlib.md5(unique_string.encode()).hexdigest()[:12]
    
    def scroll_page(self, scroll_count: int = 3):
        """Scroll page to load dynamic content"""
        for _ in range(scroll_count):
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(1.5)
    
    def safe_get_text(self, element, selector: str, by: By = By.CSS_SELECTOR, default: str = "") -> str:
        """Safely get text from an element"""
        try:
            found = element.find_element(by, selector)
            return found.text.strip() if found else default
        except NoSuchElementException:
            return default
    
    def extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from job description text"""
        # Common technical skills to look for
        skill_patterns = [
            # Programming Languages
            r'\b(python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|php|swift|kotlin|scala|r)\b',
            # Web Technologies
            r'\b(react|angular|vue|node\.?js|express|django|flask|spring|laravel|rails|next\.?js|nuxt)\b',
            # Databases
            r'\b(mysql|postgresql|mongodb|redis|elasticsearch|oracle|sql server|sqlite|cassandra|dynamodb)\b',
            # Cloud & DevOps
            r'\b(aws|azure|gcp|docker|kubernetes|jenkins|terraform|ansible|ci/cd|git|github|gitlab)\b',
            # Data Science & ML
            r'\b(machine learning|deep learning|tensorflow|pytorch|pandas|numpy|scikit-learn|nlp|computer vision)\b',
            # Other Skills
            r'\b(agile|scrum|rest api|graphql|microservices|linux|unix|networking|cybersecurity)\b',
            # Soft Skills
            r'\b(communication|leadership|teamwork|problem solving|analytical|critical thinking)\b',
        ]
        
        skills = set()
        text_lower = text.lower()
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            skills.update([m.lower() for m in matches])
        
        return list(skills)
    
    def search_jobs(self, keywords: List[str], location: str = "", job_type: str = "") -> List[JobListing]:
        """Search for jobs - to be implemented by subclasses"""
        raise NotImplementedError


class LinkedInScraper(JobScraperBase):
    """LinkedIn Jobs Scraper"""
    
    BASE_URL = "https://www.linkedin.com/jobs/search"
    
    def search_jobs(self, keywords: List[str], location: str = "India", job_type: str = "") -> List[JobListing]:
        """Search LinkedIn for jobs"""
        jobs = []
        
        try:
            self.setup_driver()
            
            # Build search URL
            keyword_str = " ".join(keywords)
            search_url = f"{self.BASE_URL}?keywords={keyword_str}&location={location}"
            
            if job_type.lower() == "internship":
                search_url += "&f_E=1"  # Entry level / Internship filter
            
            logger.info(f"Searching LinkedIn: {search_url}")
            self.driver.get(search_url)
            time.sleep(3)
            
            # Scroll to load more jobs
            self.scroll_page(3)
            
            # Find job cards
            job_cards = self.driver.find_elements(By.CSS_SELECTOR, ".base-card")
            
            for card in job_cards[:20]:  # Limit to 20 jobs
                try:
                    title = self.safe_get_text(card, ".base-search-card__title")
                    company = self.safe_get_text(card, ".base-search-card__subtitle")
                    location = self.safe_get_text(card, ".job-search-card__location")
                    posted = self.safe_get_text(card, ".job-search-card__listdate")
                    
                    # Get job link
                    try:
                        link_elem = card.find_element(By.CSS_SELECTOR, "a.base-card__full-link")
                        apply_url = link_elem.get_attribute("href")
                    except:
                        apply_url = ""
                    
                    if title and company:
                        job = JobListing(
                            id=self.generate_job_id(title, company, "linkedin"),
                            title=title,
                            company=company,
                            location=location,
                            job_type=job_type if job_type else "Full-time",
                            experience_required="",
                            salary="Not disclosed",
                            description="",
                            skills_required=keywords,
                            posted_date=posted,
                            apply_url=apply_url,
                            source="linkedin"
                        )
                        jobs.append(job)
                        
                except Exception as e:
                    logger.warning(f"Error parsing LinkedIn job card: {e}")
                    continue
            
            logger.info(f"Found {len(jobs)} jobs on LinkedIn")
            
        except Exception as e:
            logger.error(f"LinkedIn scraping error: {e}")
        finally:
            self.close_driver()
        
        return jobs


class InternshalaScaper(JobScraperBase):
    """Internshala Jobs/Internships Scraper"""
    
    BASE_URL = "https://internshala.com"
    
    def search_jobs(self, keywords: List[str], location: str = "", job_type: str = "internship") -> List[JobListing]:
        """Search Internshala for internships/jobs"""
        jobs = []
        
        try:
            self.setup_driver()
            
            # Build search URL
            keyword_str = "-".join(keywords).lower()
            
            if job_type.lower() == "internship":
                search_url = f"{self.BASE_URL}/internships/{keyword_str}-internship"
            else:
                search_url = f"{self.BASE_URL}/jobs/{keyword_str}-jobs"
            
            if location:
                search_url += f"-in-{location.lower()}"
            
            logger.info(f"Searching Internshala: {search_url}")
            self.driver.get(search_url)
            time.sleep(3)
            
            # Scroll to load more
            self.scroll_page(2)
            
            # Find internship/job cards
            cards = self.driver.find_elements(By.CSS_SELECTOR, ".individual_internship, .individual_job")
            
            for card in cards[:20]:
                try:
                    title = self.safe_get_text(card, ".job-internship-name, .job_title, h3 a")
                    company = self.safe_get_text(card, ".company-name, .company_name, .link_display_like_text")
                    loc = self.safe_get_text(card, ".locations, .location_link")
                    stipend = self.safe_get_text(card, ".stipend, .salary")
                    duration = self.safe_get_text(card, ".duration, .other_detail_item_value")
                    
                    # Get apply link
                    try:
                        link_elem = card.find_element(By.CSS_SELECTOR, "a.view_detail_button, a.job-title-href, h3 a")
                        apply_url = link_elem.get_attribute("href")
                        if apply_url and not apply_url.startswith("http"):
                            apply_url = self.BASE_URL + apply_url
                    except:
                        apply_url = ""
                    
                    if title and company:
                        job = JobListing(
                            id=self.generate_job_id(title, company, "internshala"),
                            title=title,
                            company=company,
                            location=loc if loc else "Remote",
                            job_type="Internship" if job_type.lower() == "internship" else "Full-time",
                            experience_required=duration if duration else "Freshers",
                            salary=stipend if stipend else "Not disclosed",
                            description="",
                            skills_required=keywords,
                            posted_date="",
                            apply_url=apply_url,
                            source="internshala"
                        )
                        jobs.append(job)
                        
                except Exception as e:
                    logger.warning(f"Error parsing Internshala card: {e}")
                    continue
            
            logger.info(f"Found {len(jobs)} listings on Internshala")
            
        except Exception as e:
            logger.error(f"Internshala scraping error: {e}")
        finally:
            self.close_driver()
        
        return jobs


class FounditScraper(JobScraperBase):
    """Foundit (Monster India) Jobs Scraper"""
    
    BASE_URL = "https://www.foundit.in/srp/results"
    
    def search_jobs(self, keywords: List[str], location: str = "India", job_type: str = "") -> List[JobListing]:
        """Search Foundit for jobs"""
        jobs = []
        
        try:
            self.setup_driver()
            
            # Build search URL
            keyword_str = " ".join(keywords)
            search_url = f"{self.BASE_URL}?query={keyword_str}&locations={location}"
            
            if job_type.lower() == "internship":
                search_url += "&experience=0"
            
            logger.info(f"Searching Foundit: {search_url}")
            self.driver.get(search_url)
            time.sleep(4)
            
            # Wait for job cards to load
            try:
                self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".card-apply-content, .srpResultCardContainer")))
            except TimeoutException:
                logger.warning("Foundit jobs not loaded in time")
                return jobs
            
            # Scroll to load more
            self.scroll_page(2)
            
            # Find job cards
            cards = self.driver.find_elements(By.CSS_SELECTOR, ".card-apply-content, .srpResultCardContainer, .jobCard")
            
            for card in cards[:20]:
                try:
                    title = self.safe_get_text(card, ".job-title, .jobTitle, h3 a")
                    company = self.safe_get_text(card, ".company-name, .companyName, .comp-name")
                    loc = self.safe_get_text(card, ".location-text, .loc, .locWdth")
                    exp = self.safe_get_text(card, ".experience, .exp, .expWdth")
                    salary = self.safe_get_text(card, ".salary, .sal")
                    
                    # Get job link
                    try:
                        link_elem = card.find_element(By.CSS_SELECTOR, "a.job-title, a.jobTitle, .card-apply-content a")
                        apply_url = link_elem.get_attribute("href")
                    except:
                        apply_url = ""
                    
                    if title and company:
                        job = JobListing(
                            id=self.generate_job_id(title, company, "foundit"),
                            title=title,
                            company=company,
                            location=loc if loc else location,
                            job_type=job_type if job_type else "Full-time",
                            experience_required=exp if exp else "Not specified",
                            salary=salary if salary else "Not disclosed",
                            description="",
                            skills_required=keywords,
                            posted_date="",
                            apply_url=apply_url,
                            source="foundit"
                        )
                        jobs.append(job)
                        
                except Exception as e:
                    logger.warning(f"Error parsing Foundit card: {e}")
                    continue
            
            logger.info(f"Found {len(jobs)} jobs on Foundit")
            
        except Exception as e:
            logger.error(f"Foundit scraping error: {e}")
        finally:
            self.close_driver()
        
        return jobs


class NaukriScraper(JobScraperBase):
    """Naukri.com Jobs Scraper"""
    
    BASE_URL = "https://www.naukri.com"
    
    def search_jobs(self, keywords: List[str], location: str = "", job_type: str = "") -> List[JobListing]:
        """Search Naukri for jobs"""
        jobs = []
        
        try:
            self.setup_driver()
            
            # Build search URL
            keyword_str = "-".join(keywords).lower()
            search_url = f"{self.BASE_URL}/{keyword_str}-jobs"
            
            if location:
                search_url += f"-in-{location.lower()}"
            
            logger.info(f"Searching Naukri: {search_url}")
            self.driver.get(search_url)
            time.sleep(4)
            
            # Scroll to load more
            self.scroll_page(2)
            
            # Find job cards
            cards = self.driver.find_elements(By.CSS_SELECTOR, ".jobTuple, .cust-job-tuple, article.jobTuple")
            
            for card in cards[:20]:
                try:
                    title = self.safe_get_text(card, ".title, .jobTitle, a.title")
                    company = self.safe_get_text(card, ".companyInfo, .comp-name, .subTitle")
                    loc = self.safe_get_text(card, ".location, .loc, .locWdth")
                    exp = self.safe_get_text(card, ".experience, .exp, .expwdth")
                    salary = self.safe_get_text(card, ".salary, .sal")
                    posted = self.safe_get_text(card, ".freshness, .job-post-day")
                    
                    # Get skills
                    skills_text = self.safe_get_text(card, ".skills, .tags-gt, .skill-tag-list")
                    skills = self.extract_skills_from_text(skills_text) if skills_text else keywords
                    
                    # Get job link
                    try:
                        link_elem = card.find_element(By.CSS_SELECTOR, "a.title, a.jobTitle")
                        apply_url = link_elem.get_attribute("href")
                    except:
                        apply_url = ""
                    
                    if title and company:
                        job = JobListing(
                            id=self.generate_job_id(title, company, "naukri"),
                            title=title,
                            company=company,
                            location=loc if loc else "India",
                            job_type=job_type if job_type else "Full-time",
                            experience_required=exp if exp else "Not specified",
                            salary=salary if salary else "Not disclosed",
                            description="",
                            skills_required=skills,
                            posted_date=posted,
                            apply_url=apply_url,
                            source="naukri"
                        )
                        jobs.append(job)
                        
                except Exception as e:
                    logger.warning(f"Error parsing Naukri card: {e}")
                    continue
            
            logger.info(f"Found {len(jobs)} jobs on Naukri")
            
        except Exception as e:
            logger.error(f"Naukri scraping error: {e}")
        finally:
            self.close_driver()
        
        return jobs


class IndeedScraper(JobScraperBase):
    """Indeed Jobs Scraper"""
    
    BASE_URL = "https://www.indeed.com/jobs"
    
    def search_jobs(self, keywords: List[str], location: str = "India", job_type: str = "") -> List[JobListing]:
        """Search Indeed for jobs"""
        jobs = []
        
        try:
            self.setup_driver()
            
            # Build search URL
            keyword_str = " ".join(keywords)
            search_url = f"{self.BASE_URL}?q={keyword_str}&l={location}"
            
            if job_type.lower() == "internship":
                search_url += "&jt=internship"
            
            logger.info(f"Searching Indeed: {search_url}")
            self.driver.get(search_url)
            time.sleep(3)
            
            # Scroll to load more
            self.scroll_page(2)
            
            # Find job cards
            cards = self.driver.find_elements(By.CSS_SELECTOR, ".job_seen_beacon, .jobsearch-ResultsList > li, .resultContent")
            
            for card in cards[:20]:
                try:
                    title = self.safe_get_text(card, ".jobTitle, h2.jobTitle span")
                    company = self.safe_get_text(card, ".companyName, [data-testid='company-name']")
                    loc = self.safe_get_text(card, ".companyLocation, [data-testid='text-location']")
                    salary = self.safe_get_text(card, ".salary-snippet, .estimated-salary")
                    posted = self.safe_get_text(card, ".date, span.date")
                    
                    # Get job link
                    try:
                        link_elem = card.find_element(By.CSS_SELECTOR, "a.jcs-JobTitle, h2 a")
                        apply_url = link_elem.get_attribute("href")
                        if apply_url and not apply_url.startswith("http"):
                            apply_url = "https://www.indeed.com" + apply_url
                    except:
                        apply_url = ""
                    
                    if title and company:
                        job = JobListing(
                            id=self.generate_job_id(title, company, "indeed"),
                            title=title,
                            company=company,
                            location=loc if loc else location,
                            job_type=job_type if job_type else "Full-time",
                            experience_required="",
                            salary=salary if salary else "Not disclosed",
                            description="",
                            skills_required=keywords,
                            posted_date=posted,
                            apply_url=apply_url,
                            source="indeed"
                        )
                        jobs.append(job)
                        
                except Exception as e:
                    logger.warning(f"Error parsing Indeed card: {e}")
                    continue
            
            logger.info(f"Found {len(jobs)} jobs on Indeed")
            
        except Exception as e:
            logger.error(f"Indeed scraping error: {e}")
        finally:
            self.close_driver()
        
        return jobs


class JobMatcher:
    """Match jobs with resume skills and profile"""
    
    def __init__(self):
        self.skill_synonyms = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'ml': 'machine learning',
            'dl': 'deep learning',
            'ai': 'artificial intelligence',
            'frontend': 'front-end',
            'backend': 'back-end',
            'fullstack': 'full-stack',
            'nodejs': 'node.js',
            'reactjs': 'react',
            'vuejs': 'vue',
            'angularjs': 'angular',
            'nextjs': 'next.js',
            'db': 'database',
            'sql': 'mysql',
            'nosql': 'mongodb',
            'k8s': 'kubernetes',
            'ci cd': 'ci/cd',
            'devops': 'development operations',
        }
    
    def normalize_skill(self, skill: str) -> str:
        """Normalize a skill name"""
        skill_lower = skill.lower().strip()
        return self.skill_synonyms.get(skill_lower, skill_lower)
    
    def extract_skills_from_resume(self, resume_text: str) -> List[str]:
        """Extract skills from resume text"""
        # Technical skills patterns
        skill_patterns = [
            # Programming Languages
            r'\b(python|java|javascript|typescript|c\+\+|c#|ruby|go|rust|php|swift|kotlin|scala|r|matlab)\b',
            # Web Technologies
            r'\b(react|angular|vue|node\.?js|express|django|flask|spring|laravel|rails|next\.?js|nuxt|html|css|sass|less|bootstrap|tailwind)\b',
            # Databases
            r'\b(mysql|postgresql|mongodb|redis|elasticsearch|oracle|sql server|sqlite|cassandra|dynamodb|firebase)\b',
            # Cloud & DevOps
            r'\b(aws|azure|gcp|docker|kubernetes|jenkins|terraform|ansible|ci/cd|git|github|gitlab|bitbucket)\b',
            # Data Science & ML
            r'\b(machine learning|deep learning|tensorflow|pytorch|pandas|numpy|scikit-learn|nlp|computer vision|keras|opencv)\b',
            # Tools
            r'\b(jira|confluence|slack|trello|figma|photoshop|illustrator|vs code|vim|postman|swagger)\b',
            # Other Tech
            r'\b(rest api|graphql|microservices|linux|unix|windows server|networking|cybersecurity|blockchain|web3)\b',
        ]
        
        skills = set()
        text_lower = resume_text.lower()
        
        for pattern in skill_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            skills.update([self.normalize_skill(m) for m in matches])
        
        return list(skills)
    
    def extract_experience_years(self, resume_text: str) -> int:
        """Extract years of experience from resume"""
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)',
            r'(?:experience|exp)\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|of)\s*(?:software|development|programming)',
        ]
        
        max_years = 0
        for pattern in patterns:
            matches = re.findall(pattern, resume_text.lower())
            for match in matches:
                try:
                    years = int(match)
                    if years < 50:  # Sanity check
                        max_years = max(max_years, years)
                except ValueError:
                    continue
        
        return max_years
    
    def calculate_match_score(self, job: JobListing, resume_skills: List[str], 
                              resume_text: str, preferred_location: str = "") -> Dict:
        """Calculate how well a job matches the resume"""
        score = 0.0
        matched_skills = []
        missing_skills = []
        
        # Normalize resume skills
        normalized_resume_skills = set(self.normalize_skill(s) for s in resume_skills)
        
        # Normalize job required skills
        normalized_job_skills = set(self.normalize_skill(s) for s in job.skills_required)
        
        # Also extract skills from job title and description
        title_skills = set(self.normalize_skill(s) for s in self.extract_skills_from_resume(job.title))
        desc_skills = set(self.normalize_skill(s) for s in self.extract_skills_from_resume(job.description))
        all_job_skills = normalized_job_skills | title_skills | desc_skills
        
        if all_job_skills:
            # Calculate skill match
            matched = normalized_resume_skills & all_job_skills
            missing = all_job_skills - normalized_resume_skills
            
            matched_skills = list(matched)
            missing_skills = list(missing)
            
            # Skill match score (50% weight)
            skill_score = (len(matched) / len(all_job_skills)) * 50 if all_job_skills else 25
            score += skill_score
        else:
            # If no skills specified, give partial credit
            score += 25
        
        # Location match (20% weight)
        if preferred_location:
            job_location_lower = job.location.lower()
            preferred_lower = preferred_location.lower()
            
            if preferred_lower in job_location_lower or job_location_lower in preferred_lower:
                score += 20
            elif "remote" in job_location_lower:
                score += 15
            elif "india" in job_location_lower:
                score += 10
        else:
            score += 10  # Neutral if no preference
        
        # Job type relevance (15% weight)
        # Freshers/entry-level get bonus for internships
        experience = self.extract_experience_years(resume_text)
        
        if experience < 2 and job.job_type.lower() in ["internship", "entry level", "fresher"]:
            score += 15
        elif experience >= 2 and job.job_type.lower() in ["full-time", "full time"]:
            score += 15
        else:
            score += 8
        
        # Recency bonus (15% weight)
        # Jobs posted recently get higher scores
        posted = job.posted_date.lower() if job.posted_date else ""
        if any(term in posted for term in ["today", "just", "hour", "minute"]):
            score += 15
        elif any(term in posted for term in ["1 day", "yesterday", "2 day"]):
            score += 12
        elif any(term in posted for term in ["week", "3 day", "4 day", "5 day", "6 day"]):
            score += 8
        else:
            score += 5
        
        return {
            "score": round(min(score, 100), 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills[:10]  # Limit missing skills list
        }
    
    def match_jobs(self, jobs: List[JobListing], resume_text: str, 
                   resume_skills: List[str] = None, preferred_location: str = "") -> List[JobListing]:
        """Match and rank jobs based on resume"""
        
        # Extract skills from resume if not provided
        if not resume_skills:
            resume_skills = self.extract_skills_from_resume(resume_text)
        
        matched_jobs = []
        
        for job in jobs:
            match_result = self.calculate_match_score(
                job, resume_skills, resume_text, preferred_location
            )
            
            job.match_score = match_result["score"]
            job.matched_skills = match_result["matched_skills"]
            job.missing_skills = match_result["missing_skills"]
            matched_jobs.append(job)
        
        # Sort by match score (descending)
        matched_jobs.sort(key=lambda x: x.match_score, reverse=True)
        
        return matched_jobs


class JobScraperManager:
    """Manager class to coordinate all job scrapers"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.matcher = JobMatcher()
        self.scrapers = {
            "linkedin": LinkedInScraper,
            "internshala": InternshalaScaper,
            "foundit": FounditScraper,
            "naukri": NaukriScraper,
            "indeed": IndeedScraper,
        }
    
    def search_all_platforms(self, keywords: List[str], location: str = "India", 
                             job_type: str = "", platforms: List[str] = None,
                             max_workers: int = 3) -> List[JobListing]:
        """Search for jobs across all or selected platforms"""
        
        all_jobs = []
        
        if platforms is None:
            platforms = list(self.scrapers.keys())
        
        # Filter to valid platforms
        platforms = [p for p in platforms if p in self.scrapers]
        
        logger.info(f"Searching across platforms: {platforms}")
        
        # Use ThreadPoolExecutor for parallel scraping
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_platform = {}
            
            for platform in platforms:
                scraper_class = self.scrapers[platform]
                scraper = scraper_class(headless=self.headless)
                future = executor.submit(scraper.search_jobs, keywords, location, job_type)
                future_to_platform[future] = platform
            
            for future in as_completed(future_to_platform):
                platform = future_to_platform[future]
                try:
                    jobs = future.result()
                    all_jobs.extend(jobs)
                    logger.info(f"Collected {len(jobs)} jobs from {platform}")
                except Exception as e:
                    logger.error(f"Error scraping {platform}: {e}")
        
        # Remove duplicates based on title + company
        seen = set()
        unique_jobs = []
        for job in all_jobs:
            key = (job.title.lower(), job.company.lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        logger.info(f"Total unique jobs found: {len(unique_jobs)}")
        return unique_jobs
    
    def search_and_match(self, resume_text: str, resume_skills: List[str] = None,
                         keywords: List[str] = None, location: str = "India",
                         job_type: str = "", platforms: List[str] = None) -> Dict[str, Any]:
        """Search for jobs and match them against the resume"""
        
        # If no keywords provided, extract from resume
        if not keywords:
            keywords = self.matcher.extract_skills_from_resume(resume_text)[:10]
        
        if not keywords:
            keywords = ["software", "developer", "engineer"]
        
        logger.info(f"Searching with keywords: {keywords}")
        
        # Search across platforms
        jobs = self.search_all_platforms(
            keywords=keywords,
            location=location,
            job_type=job_type,
            platforms=platforms
        )
        
        # Match and rank jobs
        matched_jobs = self.matcher.match_jobs(
            jobs=jobs,
            resume_text=resume_text,
            resume_skills=resume_skills,
            preferred_location=location
        )
        
        # Extract resume skills for response
        extracted_skills = self.matcher.extract_skills_from_resume(resume_text)
        
        return {
            "jobs": [job.to_dict() for job in matched_jobs],
            "total_found": len(matched_jobs),
            "search_keywords": keywords,
            "extracted_resume_skills": extracted_skills,
            "platforms_searched": platforms if platforms else list(self.scrapers.keys())
        }


# Singleton instance
_job_scraper_manager = None

def get_job_scraper_manager(headless: bool = True) -> JobScraperManager:
    """Get or create the job scraper manager instance"""
    global _job_scraper_manager
    if _job_scraper_manager is None:
        _job_scraper_manager = JobScraperManager(headless=headless)
    return _job_scraper_manager
