"""
ATS (Applicant Tracking System) Analyzer Module
Analyzes resumes against job descriptions and provides ATS compatibility scores
"""

import re
import string
from typing import Dict, List, Tuple, Optional, Any
from collections import Counter
import math

# Skill synonyms for normalization
SKILL_SYNONYMS = {
    # Programming Languages
    "javascript": ["js", "ecmascript", "es6", "es2015"],
    "typescript": ["ts"],
    "python": ["py", "python3", "python2"],
    "c++": ["cpp", "c plus plus", "cplusplus"],
    "c#": ["csharp", "c sharp", "c-sharp"],
    "golang": ["go", "go lang"],
    "rust": ["rust lang", "rustlang"],
    
    # AI/ML
    "machine learning": ["ml", "machine-learning"],
    "deep learning": ["dl", "deep-learning"],
    "artificial intelligence": ["ai", "a.i."],
    "natural language processing": ["nlp", "natural-language-processing"],
    "computer vision": ["cv", "image recognition"],
    "neural network": ["nn", "neural net", "neural networks"],
    "large language model": ["llm", "large language models"],
    
    # Frameworks & Libraries
    "react": ["reactjs", "react.js", "react js"],
    "angular": ["angularjs", "angular.js", "angular js"],
    "vue": ["vuejs", "vue.js", "vue js"],
    "next.js": ["nextjs", "next js", "next"],
    "node.js": ["nodejs", "node", "node js"],
    "express": ["expressjs", "express.js"],
    "django": ["django framework"],
    "flask": ["flask framework"],
    "fastapi": ["fast api", "fast-api"],
    "spring": ["spring boot", "springboot", "spring framework"],
    "tensorflow": ["tf", "tensor flow"],
    "pytorch": ["py torch", "torch"],
    "scikit-learn": ["sklearn", "scikit learn"],
    "pandas": ["pandas library"],
    "numpy": ["np", "num py"],
    
    # Databases
    "postgresql": ["postgres", "psql", "pg"],
    "mongodb": ["mongo", "mongo db"],
    "mysql": ["my sql", "my-sql"],
    "sql server": ["mssql", "ms sql", "microsoft sql"],
    "redis": ["redis cache", "redis db"],
    "elasticsearch": ["elastic search", "elastic"],
    
    # Cloud & DevOps
    "amazon web services": ["aws", "amazon aws"],
    "google cloud platform": ["gcp", "google cloud"],
    "microsoft azure": ["azure", "ms azure"],
    "kubernetes": ["k8s", "kube"],
    "docker": ["docker container", "containerization"],
    "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous deployment"],
    "jenkins": ["jenkins ci"],
    "github actions": ["gh actions"],
    "terraform": ["tf", "terraform iac"],
    
    # Methodologies
    "agile": ["agile methodology", "scrum", "kanban"],
    "devops": ["dev ops", "dev-ops"],
    "test driven development": ["tdd", "test-driven"],
    "object oriented programming": ["oop", "object-oriented"],
    "functional programming": ["fp"],
    "restful api": ["rest api", "rest", "restful"],
    "graphql": ["graph ql", "gql"],
    "microservices": ["micro services", "microservice architecture"],
    
    # Tools
    "git": ["github", "gitlab", "bitbucket", "version control"],
    "jira": ["jira software"],
    "confluence": ["atlassian confluence"],
    "figma": ["figma design"],
    "visual studio code": ["vscode", "vs code"],
    
    # Soft Skills
    "communication": ["communication skills", "verbal communication", "written communication"],
    "teamwork": ["team work", "collaboration", "collaborative"],
    "leadership": ["team leadership", "lead", "leading"],
    "problem solving": ["problem-solving", "analytical thinking", "critical thinking"],
    "time management": ["time-management", "deadline management"],
}

# Standard resume section headers
STANDARD_SECTIONS = [
    "summary", "objective", "profile", "about",
    "experience", "work experience", "employment", "work history", "professional experience",
    "education", "academic", "qualifications",
    "skills", "technical skills", "core competencies", "expertise",
    "projects", "personal projects", "academic projects",
    "certifications", "certificates", "credentials", "licenses",
    "awards", "achievements", "honors", "accomplishments",
    "publications", "research",
    "languages", "language proficiency",
    "interests", "hobbies", "activities",
    "references", "contact", "contact information"
]

# Job title synonyms
JOB_TITLE_SYNONYMS = {
    "software engineer": ["software developer", "sde", "developer", "programmer", "coder"],
    "frontend developer": ["front-end developer", "front end developer", "ui developer", "frontend engineer"],
    "backend developer": ["back-end developer", "back end developer", "server developer", "backend engineer"],
    "full stack developer": ["fullstack developer", "full-stack developer", "full stack engineer"],
    "data scientist": ["data science", "ds", "data analyst"],
    "machine learning engineer": ["ml engineer", "ai engineer", "ml developer"],
    "devops engineer": ["devops", "site reliability engineer", "sre", "platform engineer"],
    "product manager": ["pm", "product owner", "po"],
    "project manager": ["program manager", "delivery manager"],
    "ux designer": ["user experience designer", "ux/ui designer", "product designer"],
    "qa engineer": ["quality assurance", "test engineer", "tester", "sdet"],
}

# Degree synonyms
DEGREE_SYNONYMS = {
    "bachelor": ["b.s.", "bs", "b.a.", "ba", "bsc", "b.sc", "btech", "b.tech", "be", "b.e."],
    "master": ["m.s.", "ms", "m.a.", "ma", "msc", "m.sc", "mtech", "m.tech", "me", "m.e.", "mba"],
    "phd": ["ph.d.", "doctorate", "doctoral", "doctor of philosophy"],
    "associate": ["a.s.", "as", "a.a.", "aa"],
}


class ATSAnalyzer:
    """Analyzes resume against job description for ATS compatibility"""
    
    def __init__(self):
        self.skill_synonyms = self._build_synonym_index(SKILL_SYNONYMS)
        self.job_title_synonyms = self._build_synonym_index(JOB_TITLE_SYNONYMS)
        self.degree_synonyms = self._build_synonym_index(DEGREE_SYNONYMS)
    
    def _build_synonym_index(self, synonyms: Dict[str, List[str]]) -> Dict[str, str]:
        """Build reverse index for quick synonym lookup"""
        index = {}
        for canonical, variants in synonyms.items():
            index[canonical.lower()] = canonical.lower()
            for variant in variants:
                index[variant.lower()] = canonical.lower()
        return index
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text by lowercasing and removing extra whitespace"""
        text = text.lower()
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        text = self._normalize_text(text)
        # Remove punctuation except for important characters
        text = re.sub(r'[^\w\s\-\+\#\.]', ' ', text)
        tokens = text.split()
        return [t for t in tokens if len(t) > 1]
    
    def _extract_ngrams(self, tokens: List[str], n: int) -> List[str]:
        """Extract n-grams from token list"""
        return [' '.join(tokens[i:i+n]) for i in range(len(tokens) - n + 1)]
    
    def _normalize_skill(self, skill: str) -> str:
        """Normalize a skill using synonym mapping"""
        skill_lower = skill.lower().strip()
        return self.skill_synonyms.get(skill_lower, skill_lower)
    
    def _normalize_job_title(self, title: str) -> str:
        """Normalize a job title using synonym mapping"""
        title_lower = title.lower().strip()
        return self.job_title_synonyms.get(title_lower, title_lower)
    
    def _normalize_degree(self, degree: str) -> str:
        """Normalize a degree using synonym mapping"""
        degree_lower = degree.lower().strip()
        return self.degree_synonyms.get(degree_lower, degree_lower)
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using pattern matching"""
        tokens = self._tokenize(text)
        skills = set()
        
        # Check single words and multi-word combinations
        for n in range(1, 4):
            ngrams = self._extract_ngrams(tokens, n)
            for ngram in ngrams:
                normalized = self._normalize_skill(ngram)
                if normalized in self.skill_synonyms.values():
                    skills.add(normalized)
        
        # Also extract from SKILL_SYNONYMS keys that appear in text
        text_lower = text.lower()
        for skill in SKILL_SYNONYMS.keys():
            if skill in text_lower:
                skills.add(skill)
            for variant in SKILL_SYNONYMS[skill]:
                if variant in text_lower:
                    skills.add(skill)
        
        return list(skills)
    
    def _extract_experience_years(self, text: str) -> Optional[int]:
        """Extract years of experience from text"""
        patterns = [
            r'(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:experience|exp)',
            r'(?:experience|exp)(?:\s+of)?\s*:?\s*(\d+)\+?\s*(?:years?|yrs?)',
            r'(\d+)\+?\s*(?:years?|yrs?)\s+(?:working|in|of)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        """Extract education information from text"""
        education = []
        text_lower = text.lower()
        
        # Check for degrees
        for degree_type, variants in DEGREE_SYNONYMS.items():
            for variant in [degree_type] + variants:
                if variant in text_lower:
                    education.append({
                        "degree": degree_type,
                        "found": variant
                    })
                    break
        
        return education
    
    def _detect_sections(self, text: str) -> Dict[str, bool]:
        """Detect which standard sections are present in the resume"""
        text_lower = text.lower()
        sections = {}
        
        for section in STANDARD_SECTIONS:
            # Check if section header exists
            patterns = [
                rf'\b{section}\b',
                rf'\b{section}:',
                rf'\b{section}\s*[-:]',
            ]
            found = any(re.search(p, text_lower) for p in patterns)
            sections[section] = found
        
        return sections
    
    def _check_formatting(self, text: str) -> Dict[str, Any]:
        """Check formatting compliance"""
        issues = []
        score = 100
        
        # Check for email
        has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
        if not has_email:
            issues.append("No email address found")
            score -= 10
        
        # Check for phone
        has_phone = bool(re.search(r'[\+]?[\d\-\(\)\s]{10,}', text))
        if not has_phone:
            issues.append("No phone number found")
            score -= 5
        
        # Check length
        word_count = len(text.split())
        if word_count < 100:
            issues.append("Resume seems too short (less than 100 words)")
            score -= 15
        elif word_count > 1500:
            issues.append("Resume may be too long (more than 1500 words)")
            score -= 5
        
        # Check for standard sections
        sections = self._detect_sections(text)
        critical_sections = ["experience", "education", "skills"]
        for section in critical_sections:
            if not any(sections.get(s, False) for s in STANDARD_SECTIONS if section in s):
                issues.append(f"Missing or unclear '{section}' section")
                score -= 10
        
        return {
            "score": max(0, score),
            "issues": issues,
            "has_email": has_email,
            "has_phone": has_phone,
            "word_count": word_count,
            "detected_sections": [s for s, found in sections.items() if found]
        }
    
    def _calculate_keyword_match(
        self, 
        resume_skills: List[str], 
        jd_skills: List[str]
    ) -> Dict[str, Any]:
        """Calculate keyword matching score"""
        if not jd_skills:
            return {
                "score": 50,
                "matched": [],
                "missing": [],
                "match_percentage": 0
            }
        
        resume_skills_set = set(resume_skills)
        jd_skills_set = set(jd_skills)
        
        matched = resume_skills_set.intersection(jd_skills_set)
        missing = jd_skills_set - resume_skills_set
        extra = resume_skills_set - jd_skills_set
        
        match_percentage = (len(matched) / len(jd_skills_set)) * 100 if jd_skills_set else 0
        
        # Calculate score (0-100)
        base_score = match_percentage
        
        # Bonus for having additional relevant skills
        bonus = min(10, len(extra) * 2)
        
        score = min(100, base_score + bonus)
        
        return {
            "score": round(score, 1),
            "matched": list(matched),
            "missing": list(missing),
            "extra": list(extra),
            "match_percentage": round(match_percentage, 1)
        }
    
    def _calculate_experience_match(
        self, 
        resume_exp: Optional[int], 
        jd_exp: Optional[int]
    ) -> Dict[str, Any]:
        """Calculate experience matching score"""
        if jd_exp is None:
            return {
                "score": 70,
                "message": "No specific experience requirement found in job description",
                "resume_years": resume_exp,
                "required_years": jd_exp
            }
        
        if resume_exp is None:
            return {
                "score": 30,
                "message": "Could not determine years of experience from resume",
                "resume_years": resume_exp,
                "required_years": jd_exp
            }
        
        if resume_exp >= jd_exp:
            score = 100
            message = f"Experience meets or exceeds requirement ({resume_exp} >= {jd_exp} years)"
        elif resume_exp >= jd_exp * 0.7:
            score = 70
            message = f"Experience is close to requirement ({resume_exp} vs {jd_exp} years)"
        elif resume_exp >= jd_exp * 0.5:
            score = 50
            message = f"Experience is below requirement ({resume_exp} vs {jd_exp} years)"
        else:
            score = 30
            message = f"Experience significantly below requirement ({resume_exp} vs {jd_exp} years)"
        
        return {
            "score": score,
            "message": message,
            "resume_years": resume_exp,
            "required_years": jd_exp
        }
    
    def _calculate_semantic_similarity(
        self, 
        resume_text: str, 
        jd_text: str
    ) -> Dict[str, Any]:
        """Calculate semantic similarity using TF-IDF based approach"""
        resume_tokens = self._tokenize(resume_text)
        jd_tokens = self._tokenize(jd_text)
        
        if not resume_tokens or not jd_tokens:
            return {"score": 0, "method": "tf-idf"}
        
        # Build vocabulary
        all_tokens = list(set(resume_tokens + jd_tokens))
        
        # Calculate TF for both documents
        resume_tf = Counter(resume_tokens)
        jd_tf = Counter(jd_tokens)
        
        # Calculate TF-IDF vectors
        def tfidf_vector(tf_counter, doc_len):
            vector = []
            for token in all_tokens:
                tf = tf_counter.get(token, 0) / doc_len if doc_len > 0 else 0
                # Simple IDF: log(2 / (1 + docs_containing_term))
                docs_with_term = (1 if token in resume_tf else 0) + (1 if token in jd_tf else 0)
                idf = math.log(2 / (1 + docs_with_term)) + 1
                vector.append(tf * idf)
            return vector
        
        resume_vector = tfidf_vector(resume_tf, len(resume_tokens))
        jd_vector = tfidf_vector(jd_tf, len(jd_tokens))
        
        # Calculate cosine similarity
        dot_product = sum(a * b for a, b in zip(resume_vector, jd_vector))
        resume_norm = math.sqrt(sum(a * a for a in resume_vector))
        jd_norm = math.sqrt(sum(b * b for b in jd_vector))
        
        if resume_norm == 0 or jd_norm == 0:
            similarity = 0
        else:
            similarity = dot_product / (resume_norm * jd_norm)
        
        # Convert to 0-100 score
        score = round(similarity * 100, 1)
        
        return {
            "score": min(100, score),
            "method": "tf-idf cosine similarity"
        }
    
    def analyze(
        self, 
        resume_text: str, 
        job_description: str
    ) -> Dict[str, Any]:
        """
        Main analysis function that compares resume against job description
        
        Args:
            resume_text: The full text content of the resume
            job_description: The full text content of the job description
            
        Returns:
            Dictionary containing overall score and detailed breakdown
        """
        # Extract information from both documents
        resume_skills = self._extract_skills(resume_text)
        jd_skills = self._extract_skills(job_description)
        
        resume_exp = self._extract_experience_years(resume_text)
        jd_exp = self._extract_experience_years(job_description)
        
        resume_education = self._extract_education(resume_text)
        jd_education = self._extract_education(job_description)
        
        # Calculate individual scores
        formatting_result = self._check_formatting(resume_text)
        keyword_result = self._calculate_keyword_match(resume_skills, jd_skills)
        experience_result = self._calculate_experience_match(resume_exp, jd_exp)
        semantic_result = self._calculate_semantic_similarity(resume_text, job_description)
        
        # Weighted scoring
        weights = {
            "keyword_match": 0.35,
            "experience_match": 0.20,
            "formatting": 0.15,
            "semantic_similarity": 0.30
        }
        
        overall_score = (
            keyword_result["score"] * weights["keyword_match"] +
            experience_result["score"] * weights["experience_match"] +
            formatting_result["score"] * weights["formatting"] +
            semantic_result["score"] * weights["semantic_similarity"]
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            keyword_result, 
            experience_result, 
            formatting_result,
            overall_score
        )
        
        # Determine score category
        if overall_score >= 80:
            category = "Excellent"
            category_description = "Your resume is highly compatible with this job description"
        elif overall_score >= 60:
            category = "Good"
            category_description = "Your resume has good compatibility with some room for improvement"
        elif overall_score >= 40:
            category = "Fair"
            category_description = "Your resume needs optimization for this role"
        else:
            category = "Needs Improvement"
            category_description = "Consider significant revisions to better match this job"
        
        return {
            "overall_score": round(overall_score, 1),
            "category": category,
            "category_description": category_description,
            "breakdown": {
                "keyword_match": {
                    **keyword_result,
                    "weight": weights["keyword_match"]
                },
                "experience_match": {
                    **experience_result,
                    "weight": weights["experience_match"]
                },
                "formatting": {
                    **formatting_result,
                    "weight": weights["formatting"]
                },
                "semantic_similarity": {
                    **semantic_result,
                    "weight": weights["semantic_similarity"]
                }
            },
            "extracted_data": {
                "resume_skills": resume_skills,
                "jd_skills": jd_skills,
                "resume_experience_years": resume_exp,
                "jd_experience_years": jd_exp,
                "resume_education": resume_education,
                "jd_education": jd_education
            },
            "recommendations": recommendations
        }
    
    def _generate_recommendations(
        self,
        keyword_result: Dict[str, Any],
        experience_result: Dict[str, Any],
        formatting_result: Dict[str, Any],
        overall_score: float
    ) -> List[Dict[str, str]]:
        """Generate actionable recommendations based on analysis"""
        recommendations = []
        
        # Keyword recommendations
        missing_skills = keyword_result.get("missing", [])
        if missing_skills:
            top_missing = missing_skills[:5]
            recommendations.append({
                "category": "Skills Gap",
                "priority": "high",
                "message": f"Add these skills if applicable: {', '.join(top_missing)}",
                "details": "These skills are mentioned in the job description but not found in your resume"
            })
        
        if keyword_result["score"] < 50:
            recommendations.append({
                "category": "Keyword Optimization",
                "priority": "high",
                "message": "Your resume lacks many keywords from the job description",
                "details": "Review the job description and incorporate relevant terminology into your resume"
            })
        
        # Experience recommendations
        if experience_result["score"] < 70:
            recommendations.append({
                "category": "Experience",
                "priority": "medium",
                "message": experience_result.get("message", "Consider highlighting relevant experience"),
                "details": "If you have relevant experience, make sure it's clearly stated with specific timeframes"
            })
        
        # Formatting recommendations
        for issue in formatting_result.get("issues", []):
            recommendations.append({
                "category": "Formatting",
                "priority": "medium",
                "message": issue,
                "details": "ATS systems work better with well-structured resumes"
            })
        
        # General recommendations based on overall score
        if overall_score < 60:
            recommendations.append({
                "category": "General",
                "priority": "high",
                "message": "Consider tailoring your resume specifically for this role",
                "details": "Customizing your resume for each application significantly improves ATS scores"
            })
        
        if not recommendations:
            recommendations.append({
                "category": "General",
                "priority": "low",
                "message": "Your resume is well-optimized for this job description",
                "details": "Continue to keep your resume updated with new skills and achievements"
            })
        
        return recommendations


# Singleton instance
_analyzer_instance = None


def get_ats_analyzer() -> ATSAnalyzer:
    """Get singleton instance of ATS analyzer"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = ATSAnalyzer()
    return _analyzer_instance
