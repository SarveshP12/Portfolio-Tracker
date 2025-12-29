"""
GitHub Repository Analyzer using NLP
Analyzes GitHub repositories and generates intelligent descriptions
"""

import os
import re
import requests
from typing import Dict, List, Optional, Any
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import torch


class GitHubAnalyzer:
    """Analyzes GitHub repositories and generates NLP-powered descriptions"""
    
    def __init__(self, github_token: Optional[str] = None):
        self.github_token = github_token or os.getenv("GITHUB_TOKEN")
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "JobPred-CV-Builder",
        }
        if self.github_token:
            self.headers["Authorization"] = f"Bearer {self.github_token}"
        
        # Initialize summarization model
        self._summarizer = None
        self._tokenizer = None
        
    def _get_summarizer(self):
        """Lazy load the summarization model"""
        if self._summarizer is None:
            try:
                # Use a lightweight model for summarization
                model_name = "facebook/bart-large-cnn"
                self._tokenizer = AutoTokenizer.from_pretrained(model_name)
                model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                
                device = 0 if torch.cuda.is_available() else -1
                self._summarizer = pipeline(
                    "summarization",
                    model=model,
                    tokenizer=self._tokenizer,
                    device=device
                )
            except Exception as e:
                print(f"Warning: Could not load summarization model: {e}")
                self._summarizer = None
        return self._summarizer
    
    def extract_username_from_url(self, github_url: str) -> Optional[str]:
        """Extract GitHub username from various URL formats"""
        if not github_url:
            return None
        
        # Clean the URL
        clean_url = github_url.strip().rstrip("/")
        
        # Handle direct username
        if not "/" in clean_url and not "." in clean_url:
            return clean_url.replace("@", "")
        
        # Handle @username format
        if clean_url.startswith("@"):
            return clean_url[1:]
        
        # Try URL parsing
        try:
            if not clean_url.startswith("http"):
                clean_url = "https://" + clean_url
            
            match = re.search(r"github\.com/([^/\s]+)", clean_url)
            if match:
                return match.group(1)
        except Exception:
            pass
        
        return None
    
    def fetch_repository_details(self, owner: str, repo_name: str) -> Optional[Dict]:
        """Fetch detailed information about a repository"""
        try:
            # Get repo info
            repo_url = f"https://api.github.com/repos/{owner}/{repo_name}"
            response = requests.get(repo_url, headers=self.headers)
            
            if response.status_code != 200:
                return None
            
            repo_data = response.json()
            
            # Get README content
            readme_content = self._fetch_readme(owner, repo_name)
            
            # Get languages used
            languages = self._fetch_languages(owner, repo_name)
            
            # Get recent commits for activity description
            commits = self._fetch_recent_commits(owner, repo_name)
            
            return {
                "name": repo_data.get("name"),
                "full_name": repo_data.get("full_name"),
                "description": repo_data.get("description"),
                "readme": readme_content,
                "languages": languages,
                "topics": repo_data.get("topics", []),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "primary_language": repo_data.get("language"),
                "homepage": repo_data.get("homepage"),
                "created_at": repo_data.get("created_at"),
                "updated_at": repo_data.get("updated_at"),
                "commits": commits,
                "url": repo_data.get("html_url"),
            }
        except Exception as e:
            print(f"Error fetching repository details: {e}")
            return None
    
    def _fetch_readme(self, owner: str, repo_name: str) -> Optional[str]:
        """Fetch README content from a repository"""
        try:
            readme_url = f"https://api.github.com/repos/{owner}/{repo_name}/readme"
            response = requests.get(readme_url, headers=self.headers)
            
            if response.status_code != 200:
                return None
            
            readme_data = response.json()
            
            # Decode base64 content
            import base64
            content = base64.b64decode(readme_data.get("content", "")).decode("utf-8")
            
            # Clean markdown content
            content = self._clean_markdown(content)
            
            return content[:3000]  # Limit content length
        except Exception:
            return None
    
    def _fetch_languages(self, owner: str, repo_name: str) -> Dict[str, int]:
        """Fetch languages used in a repository"""
        try:
            languages_url = f"https://api.github.com/repos/{owner}/{repo_name}/languages"
            response = requests.get(languages_url, headers=self.headers)
            
            if response.status_code != 200:
                return {}
            
            return response.json()
        except Exception:
            return {}
    
    def _fetch_recent_commits(self, owner: str, repo_name: str, limit: int = 5) -> List[Dict]:
        """Fetch recent commit messages"""
        try:
            commits_url = f"https://api.github.com/repos/{owner}/{repo_name}/commits?per_page={limit}"
            response = requests.get(commits_url, headers=self.headers)
            
            if response.status_code != 200:
                return []
            
            commits_data = response.json()
            return [
                {
                    "message": commit.get("commit", {}).get("message", ""),
                    "date": commit.get("commit", {}).get("author", {}).get("date", ""),
                }
                for commit in commits_data
            ]
        except Exception:
            return []
    
    def _clean_markdown(self, content: str) -> str:
        """Clean markdown content for text processing"""
        # Remove code blocks
        content = re.sub(r"```[\s\S]*?```", "", content)
        content = re.sub(r"`[^`]+`", "", content)
        
        # Remove images
        content = re.sub(r"!\[.*?\]\(.*?\)", "", content)
        
        # Remove links but keep text
        content = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", content)
        
        # Remove HTML tags
        content = re.sub(r"<[^>]+>", "", content)
        
        # Remove markdown headers symbols
        content = re.sub(r"^#+\s*", "", content, flags=re.MULTILINE)
        
        # Remove bullet points
        content = re.sub(r"^[\*\-\+]\s*", "", content, flags=re.MULTILINE)
        
        # Remove excessive whitespace
        content = re.sub(r"\n{3,}", "\n\n", content)
        content = re.sub(r" {2,}", " ", content)
        
        return content.strip()
    
    def generate_project_description(self, repo_details: Dict) -> str:
        """Generate a 2-3 line description for a project using NLP"""
        if not repo_details:
            return "Project repository with various implementations."
        
        # Gather context for description generation
        context_parts = []
        
        # Add existing description if available
        if repo_details.get("description"):
            context_parts.append(repo_details["description"])
        
        # Add language info
        languages = repo_details.get("languages", {})
        if languages:
            main_langs = list(languages.keys())[:3]
            if main_langs:
                context_parts.append(f"Built with {', '.join(main_langs)}.")
        
        # Add topics
        topics = repo_details.get("topics", [])
        if topics:
            context_parts.append(f"Topics: {', '.join(topics[:5])}.")
        
        # Extract key info from README
        readme = repo_details.get("readme", "")
        if readme:
            # Get first meaningful paragraph
            paragraphs = [p.strip() for p in readme.split("\n\n") if len(p.strip()) > 50]
            if paragraphs:
                context_parts.append(paragraphs[0][:500])
        
        context = " ".join(context_parts)
        
        if not context:
            return self._generate_fallback_description(repo_details)
        
        # Try NLP summarization
        try:
            summarizer = self._get_summarizer()
            if summarizer and len(context) > 100:
                summary = summarizer(
                    context,
                    max_length=100,
                    min_length=30,
                    do_sample=False,
                    truncation=True
                )
                generated_text = summary[0]["summary_text"]
                
                # Clean and format the summary
                generated_text = self._format_description(generated_text, repo_details)
                return generated_text
        except Exception as e:
            print(f"Summarization failed: {e}")
        
        # Fallback to rule-based description
        return self._generate_fallback_description(repo_details)
    
    def _generate_fallback_description(self, repo_details: Dict) -> str:
        """Generate a description using rule-based approach"""
        parts = []
        
        name = repo_details.get("name", "Project")
        description = repo_details.get("description", "")
        languages = repo_details.get("languages", {})
        topics = repo_details.get("topics", [])
        primary_language = repo_details.get("primary_language", "")
        
        # Start with name and type
        project_type = self._infer_project_type(name, topics, description)
        parts.append(f"{project_type}")
        
        # Add main functionality from description
        if description:
            parts.append(description.rstrip(".") + ".")
        
        # Add technology stack
        tech_stack = []
        if primary_language:
            tech_stack.append(primary_language)
        if languages:
            other_langs = [l for l in list(languages.keys())[:3] if l != primary_language]
            tech_stack.extend(other_langs)
        
        if tech_stack:
            parts.append(f"Technologies: {', '.join(tech_stack[:4])}.")
        
        result = " ".join(parts)
        
        # Ensure it's 2-3 sentences
        sentences = result.split(". ")
        if len(sentences) > 3:
            result = ". ".join(sentences[:3]) + "."
        
        return result[:300]  # Limit length
    
    def _infer_project_type(self, name: str, topics: List[str], description: str) -> str:
        """Infer the type of project from name, topics, and description"""
        combined = f"{name} {' '.join(topics)} {description}".lower()
        
        type_keywords = {
            "web application": ["web", "webapp", "website", "frontend", "fullstack", "nextjs", "react", "vue", "angular"],
            "API service": ["api", "rest", "graphql", "backend", "server", "microservice"],
            "mobile application": ["mobile", "android", "ios", "flutter", "react-native"],
            "machine learning project": ["ml", "machine-learning", "ai", "deep-learning", "neural", "tensorflow", "pytorch"],
            "data analysis tool": ["data", "analytics", "visualization", "pandas", "jupyter"],
            "CLI tool": ["cli", "command-line", "terminal", "shell"],
            "library/package": ["library", "package", "module", "sdk", "framework"],
            "game": ["game", "unity", "godot", "pygame"],
            "automation tool": ["automation", "bot", "scraper", "crawler"],
        }
        
        for project_type, keywords in type_keywords.items():
            if any(kw in combined for kw in keywords):
                return f"A {project_type}"
        
        return "A software project"
    
    def _format_description(self, text: str, repo_details: Dict) -> str:
        """Format and enhance the generated description"""
        # Ensure proper capitalization
        text = text[0].upper() + text[1:] if text else text
        
        # Ensure it ends with a period
        if text and not text.endswith("."):
            text += "."
        
        # Add tech stack if not mentioned
        languages = repo_details.get("languages", {})
        if languages:
            main_langs = list(languages.keys())[:3]
            mentioned = any(lang.lower() in text.lower() for lang in main_langs)
            if not mentioned and main_langs:
                text += f" Built with {', '.join(main_langs)}."
        
        return text[:300]
    
    def analyze_repositories(self, github_url: str, repo_ids: Optional[List[int]] = None) -> List[Dict]:
        """Analyze GitHub repositories and generate descriptions"""
        username = self.extract_username_from_url(github_url)
        if not username:
            return []
        
        results = []
        
        try:
            # Fetch user's repositories
            repos_url = f"https://api.github.com/users/{username}/repos?sort=updated&per_page=100"
            response = requests.get(repos_url, headers=self.headers)
            
            if response.status_code != 200:
                return []
            
            repos = response.json()
            
            # Filter by repo_ids if provided
            if repo_ids:
                repos = [r for r in repos if r["id"] in repo_ids]
            
            for repo in repos:
                # Skip forks and archived repos
                if repo.get("fork") or repo.get("archived"):
                    continue
                
                repo_details = self.fetch_repository_details(username, repo["name"])
                if repo_details:
                    description = self.generate_project_description(repo_details)
                    
                    results.append({
                        "id": repo["id"],
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "url": repo["html_url"],
                        "original_description": repo.get("description"),
                        "generated_description": description,
                        "languages": list(repo_details.get("languages", {}).keys()),
                        "topics": repo_details.get("topics", []),
                        "stars": repo_details.get("stars", 0),
                        "primary_language": repo_details.get("primary_language"),
                        "created_at": repo_details.get("created_at"),
                        "updated_at": repo_details.get("updated_at"),
                    })
            
        except Exception as e:
            print(f"Error analyzing repositories: {e}")
        
        return results


# Singleton instance
_analyzer_instance = None


def get_analyzer(github_token: Optional[str] = None) -> GitHubAnalyzer:
    """Get or create the GitHub analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = GitHubAnalyzer(github_token)
    return _analyzer_instance
