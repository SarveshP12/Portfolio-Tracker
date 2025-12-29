"""
LaTeX CV Generator
Generates professional LaTeX resume code from CV data
"""

import re
from typing import Dict, List, Any, Optional
from datetime import datetime


class LaTeXCVGenerator:
    """Generates LaTeX code for professional CVs/Resumes"""
    
    def __init__(self):
        self.latex_preamble = self._get_preamble()
    
    def _get_preamble(self) -> str:
        """Get the LaTeX preamble with all required packages"""
        return r"""\documentclass[a4paper,10pt]{article}

%----------------------------------------------------------------------------------------
%	PACKAGES
%----------------------------------------------------------------------------------------
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{url}
\usepackage{parskip}
\RequirePackage{color}
\RequirePackage{graphicx}
\usepackage[usenames,dvipsnames]{xcolor}
\usepackage[scale=0.9, top=0.5cm, bottom=0.5cm]{geometry}
\usepackage{tabularx}
\usepackage{enumitem}
\newcolumntype{C}{>{\centering\arraybackslash}X}
\usepackage{titlesec}
\usepackage{multicol}
\usepackage{multirow}
\usepackage{fontawesome5}
\usepackage[unicode, draft=false]{hyperref}
\definecolor{linkcolour}{rgb}{0,0.2,0.6}
\hypersetup{colorlinks,breaklinks,urlcolor=linkcolour,linkcolor=linkcolour}

\titleformat{\section}{\Large\bfseries\scshape\raggedright}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{10pt}{10pt}

\newenvironment{joblong}[2]
{%
\begin{tabularx}{\linewidth}{@{}l X r@{}}
\textbf{#1} & \hfill & #2 \\[3pt]
\end{tabularx}%
\begin{minipage}[t]{\linewidth}
\begin{itemize}[nosep,after=\strut, leftmargin=1em, itemsep=2pt, label={--}]
}
{%
\end{itemize}
\end{minipage}
\vspace{6pt}
}

"""
    
    def _escape_latex(self, text: str) -> str:
        """Escape special LaTeX characters"""
        if not text:
            return ""
        
        # Convert to string if not already
        text = str(text)
        
        # Must escape backslash FIRST to avoid double escaping
        text = text.replace('\\', '\\textbackslash{}')
        
        # Then escape other special characters
        text = text.replace('&', '\\&')
        text = text.replace('%', '\\%')
        text = text.replace('$', '\\$')
        text = text.replace('#', '\\#')
        text = text.replace('_', '\\_')
        text = text.replace('{', '\\{')
        text = text.replace('}', '\\}')
        text = text.replace('~', '\\textasciitilde{}')
        text = text.replace('^', '\\textasciicircum{}')
        
        return text
    
    def _format_date(self, date_str: str) -> str:
        """Format date string for display"""
        if not date_str:
            return ""
        
        try:
            # Try parsing ISO format
            if "T" in date_str:
                date_obj = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            else:
                # Try common date formats
                for fmt in ["%Y-%m-%d", "%Y-%m", "%d/%m/%Y", "%m/%Y"]:
                    try:
                        date_obj = datetime.strptime(date_str, fmt)
                        break
                    except ValueError:
                        continue
                else:
                    return date_str
            
            return date_obj.strftime("%b %Y")
        except Exception:
            return date_str
    
    def _format_date_range(self, start_date: str, end_date: str, is_current: bool = False) -> str:
        """Format a date range"""
        start = self._format_date(start_date)
        
        if is_current:
            return f"{start} – Present"
        
        end = self._format_date(end_date)
        
        if start and end:
            return f"{start} – {end}"
        elif start:
            return start
        elif end:
            return end
        
        return ""
    
    def generate_header(self, profile: Dict) -> str:
        """Generate the header section with contact info"""
        name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
        name = self._escape_latex(name)
        
        if not name:
            name = "Your Name"
        
        contact_items = []
        
        # GitHub
        if profile.get("github_url"):
            github_username = self._extract_github_username(profile["github_url"])
            if github_username:
                github_url = profile['github_url'].replace('_', r'\_')
                contact_items.append(
                    f"\\href{{{github_url}}}{{\\faGithub\\ {self._escape_latex(github_username)}}}"
                )
        
        # LinkedIn
        if profile.get("linkedin_url"):
            linkedin_name = self._extract_linkedin_name(profile["linkedin_url"])
            linkedin_url = profile['linkedin_url'].replace('_', r'\_')
            contact_items.append(
                f"\\href{{{linkedin_url}}}{{\\faLinkedin\\ {self._escape_latex(linkedin_name)}}}"
            )
        
        # Email
        if profile.get("email"):
            email = profile['email']
            contact_items.append(
                f"\\href{{mailto:{email}}}{{\\faEnvelope\\ {self._escape_latex(email)}}}"
            )
        
        # Phone
        if profile.get("phone"):
            phone = self._escape_latex(profile["phone"])
            contact_items.append(f"\\faMobile\\ {phone}")
        
        contact_line = " ~ $\\vert$ ~ ".join(contact_items) if contact_items else ""
        
        return f"""
%----------------------------------------------------------------------------------------
%	HEADER
%----------------------------------------------------------------------------------------
\\begin{{center}}
{{\\Huge\\textbf{{{name}}}}}
\\vspace{{8pt}}

{contact_line}
\\end{{center}}
\\vspace{{4pt}}
"""
    
    def _extract_github_username(self, url: str) -> str:
        """Extract GitHub username from URL"""
        if not url:
            return ""
        match = re.search(r"github\.com/([^/\s]+)", url)
        return match.group(1) if match else url.split("/")[-1]
    
    def _extract_linkedin_name(self, url: str) -> str:
        """Extract LinkedIn profile name from URL"""
        if not url:
            return ""
        match = re.search(r"linkedin\.com/in/([^/\s]+)", url)
        return match.group(1) if match else url.split("/")[-1]
    
    def generate_profile_summary(self, profile: Dict) -> str:
        """Generate a profile summary section"""
        # Build summary from available profile data
        parts = []
        
        # Education context
        if profile.get("department") and profile.get("college_name"):
            dept = self._escape_latex(profile['department'])
            college = self._escape_latex(profile['college_name'])
            parts.append(f"{dept} student at {college}")
        
        # Skills summary
        skills = profile.get("skills", [])
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(",") if s.strip()]
        
        if skills and len(skills) > 0:
            escaped_skills = [self._escape_latex(s) for s in skills[:5]]
            parts.append(f"with expertise in {', '.join(escaped_skills)}")
        
        if not parts:
            return ""
        
        summary = " ".join(parts)
        
        return f"""
%----------------------------------------------------------------------------------------
%	PROFILE SUMMARY
%----------------------------------------------------------------------------------------
\\section{{Profile Summary}}
{summary}.
"""
    
    def generate_education(self, profile: Dict) -> str:
        """Generate education section"""
        education_items = []
        
        # Current education
        if profile.get("college_name"):
            year_range = f"{profile.get('batch_year', '')} -- Present" if profile.get('batch_year') else ""
            dept = profile.get('department', 'Engineering')
            degree = f"B.Tech in {dept}" if dept else "Bachelor's Degree"
            cgpa = f"CGPA: {profile.get('cgpa')}/10" if profile.get('cgpa') else ""
            
            college = self._escape_latex(profile['college_name'])
            degree_escaped = self._escape_latex(degree)
            
            edu_line = f"\\textbf{{{degree_escaped}}}, {college}"
            if year_range:
                edu_line += f" \\hfill {year_range}"
            if cgpa:
                edu_line += f" \\hfill {cgpa}"
            education_items.append(edu_line)
        
        # 12th grade
        if profile.get("twelfth_percentage"):
            education_items.append(
                f"Class XII \\hfill {profile['twelfth_percentage']}\\%"
            )
        
        # 10th grade
        if profile.get("tenth_percentage"):
            education_items.append(
                f"Class X \\hfill {profile['tenth_percentage']}\\%"
            )
        
        if not education_items:
            return ""
        
        items = "\n\n".join(education_items)
        
        return f"""
%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------
\\section{{Education}}
{items}
"""
    
    def generate_skills(self, skills: List[Dict]) -> str:
        """Generate technical skills section"""
        if not skills:
            return ""
        
        # Group skills by category
        categories: Dict[str, List[str]] = {}
        for skill in skills:
            category = skill.get("category", "Technical")
            name = skill.get("name", "")
            if name:
                if category not in categories:
                    categories[category] = []
                categories[category].append(name)
        
        if not categories:
            return ""
        
        rows = []
        for category, skill_names in categories.items():
            category_escaped = self._escape_latex(category)
            skills_escaped = ", ".join(self._escape_latex(s) for s in skill_names)
            rows.append(f"\\textbf{{{category_escaped}:}} {skills_escaped}")
        
        rows_content = " \\\\\n".join(rows)
        
        return f"""
%----------------------------------------------------------------------------------------
%	TECHNICAL SKILLS
%----------------------------------------------------------------------------------------
\\section{{Technical Skills}}
{rows_content}
"""
    
    def generate_work_experience(self, experiences: List[Dict]) -> str:
        """Generate work experience section"""
        if not experiences:
            return ""
        
        items = []
        for exp in experiences:
            position = self._escape_latex(exp.get("position", ""))
            company = self._escape_latex(exp.get("company", ""))
            location = self._escape_latex(exp.get("location", ""))
            
            date_range = self._format_date_range(
                exp.get("start_date", exp.get("startDate", "")),
                exp.get("end_date", exp.get("endDate", "")),
                exp.get("is_current", exp.get("current", False))
            )
            
            description = exp.get("description", "")
            
            # Split description into bullet points
            bullet_points = self._parse_description_to_bullets(description)
            
            if bullet_points:
                bullets_latex = "\n".join(f"\\item {bp}" for bp in bullet_points)
            else:
                bullets_latex = "\\item Contributed to team projects and initiatives."
            
            title_line = position
            if company:
                title_line += f" -- {company}"
            if location:
                title_line += f", {location}"
            
            item = f"""
\\begin{{joblong}}{{{title_line}}}{{{date_range}}}
{bullets_latex}
\\end{{joblong}}
"""
            items.append(item)
        
        content = "\n".join(items)
        
        return f"""
%----------------------------------------------------------------------------------------
%	WORK EXPERIENCE
%----------------------------------------------------------------------------------------
\\section{{Work Experience}}
{content}
"""
    
    def generate_projects(self, projects: List[Dict], github_projects: List[Dict] = None) -> str:
        """Generate projects section"""
        all_projects = []
        
        # Add analyzed GitHub projects
        if github_projects:
            for proj in github_projects:
                all_projects.append({
                    "name": proj.get("name", ""),
                    "description": proj.get("generated_description", proj.get("original_description", "")),
                    "technologies": proj.get("languages", []),
                    "url": proj.get("url", ""),
                    "date_range": self._format_date_range(
                        proj.get("created_at", ""),
                        proj.get("updated_at", "")
                    ),
                })
        
        # Add any additional projects
        if projects:
            for proj in projects:
                all_projects.append(proj)
        
        if not all_projects:
            return ""
        
        items = []
        for proj in all_projects[:6]:  # Limit to 6 projects
            name = self._escape_latex(proj.get("name", "Project"))
            date_range = proj.get("date_range", "")
            
            description = proj.get("description", "")
            bullet_points = self._parse_description_to_bullets(description)
            
            # Add technologies if available
            technologies = proj.get("technologies", [])
            if technologies:
                tech_str = ", ".join(self._escape_latex(t) for t in technologies[:5])
                bullet_points.append(f"\\textbf{{Technologies:}} {tech_str}")
            
            # Ensure at least one bullet point
            if not bullet_points:
                bullet_points = ["Software development project."]
            
            bullets_latex = "\n".join(f"\\item {bp}" for bp in bullet_points if bp)
            
            item = f"""
\\begin{{joblong}}{{{name}}}{{{date_range}}}
{bullets_latex}
\\end{{joblong}}
"""
            items.append(item)
        
        content = "\n".join(items)
        
        return f"""
%----------------------------------------------------------------------------------------
%	PROJECTS
%----------------------------------------------------------------------------------------
\\section{{Projects}}
{content}
"""
    
    def generate_certifications(self, certifications: List[Dict]) -> str:
        """Generate certifications section"""
        if not certifications:
            return ""
        
        cert_items = []
        for cert in certifications:
            name = self._escape_latex(cert.get("name", ""))
            issuer = self._escape_latex(cert.get("issuer", ""))
            date = self._format_date(cert.get("issue_date", cert.get("issueDate", "")))
            
            if name:
                cert_str = f"\\textbf{{{name}}}"
                if issuer:
                    cert_str += f" -- {issuer}"
                if date:
                    cert_str += f" \\hfill {date}"
                cert_items.append(cert_str)
        
        if not cert_items:
            return ""
        
        certs_str = " \\\\\n".join(cert_items)
        
        return f"""
%----------------------------------------------------------------------------------------
%	CERTIFICATIONS
%----------------------------------------------------------------------------------------
\\section{{Certifications}}
{certs_str}
"""
    
    def generate_awards(self, awards: List[Dict]) -> str:
        """Generate awards and achievements section"""
        if not awards:
            return ""
        
        items = []
        for award in awards:
            title = self._escape_latex(award.get("title", ""))
            issuer = self._escape_latex(award.get("issuer", ""))
            date = self._format_date(award.get("date", ""))
            description = self._escape_latex(award.get("description", ""))
            
            item_str = f"\\textbf{{{title}}}"
            if issuer:
                item_str += f" -- {issuer}"
            if date:
                item_str += f" \\hfill \\textit{{{date}}}"
            item_str += "\\\\"
            if description:
                item_str += f"\n{description}\\\\"
            
            items.append(item_str)
        
        content = "\n".join(items)
        
        return f"""
%----------------------------------------------------------------------------------------
%	AWARDS AND ACHIEVEMENTS
%----------------------------------------------------------------------------------------
\\section{{Awards \\& Achievements}}
{content}
"""
    
    def generate_extra_curricular(self, activities: List[Dict]) -> str:
        """Generate extra curricular activities section"""
        if not activities:
            return ""
        
        # Check if there are leadership roles
        leadership = [a for a in activities if a.get("role") and ("lead" in a.get("role", "").lower() or "head" in a.get("role", "").lower() or "president" in a.get("role", "").lower() or "treasurer" in a.get("role", "").lower() or "secretary" in a.get("role", "").lower())]
        other = [a for a in activities if a not in leadership]
        
        sections = []
        
        # Leadership roles
        if leadership:
            items = []
            for act in leadership:
                role = self._escape_latex(act.get("role", ""))
                org = self._escape_latex(act.get("organization", ""))
                date_range = self._format_date_range(
                    act.get("start_date", act.get("startDate", "")),
                    act.get("end_date", act.get("endDate", ""))
                )
                description = act.get("description", "")
                
                bullet_points = self._parse_description_to_bullets(description)
                
                if bullet_points:
                    bullets_latex = "\n".join(f"\\item {bp}" for bp in bullet_points)
                else:
                    bullets_latex = "\\item Contributed to organizational activities."
                
                item = f"""
\\begin{{joblong}}{{{role} -- {org}}}{{{date_range}}}
{bullets_latex}
\\end{{joblong}}
"""
                items.append(item)
            
            sections.append(f"""
%----------------------------------------------------------------------------------------
%	LEADERSHIP ROLES
%----------------------------------------------------------------------------------------
\\section{{Leadership Roles}}
{"".join(items)}
""")
        
        # Other activities
        if other:
            activity_items = []
            for act in other:
                activity = self._escape_latex(act.get("activity", ""))
                org = self._escape_latex(act.get("organization", ""))
                description = self._escape_latex(act.get("description", ""))
                
                item_str = f"\\textbf{{{activity}}}"
                if org:
                    item_str += f" -- {org}"
                if description:
                    item_str += f": {description}"
                activity_items.append(item_str)
            
            activities_str = " \\\\\n".join(activity_items)
            
            sections.append(f"""
%----------------------------------------------------------------------------------------
%	VOLUNTARY ACTIVITIES
%----------------------------------------------------------------------------------------
\\section{{Voluntary Activities}}
{activities_str}
""")
        
        return "\n".join(sections)
    
    def _parse_description_to_bullets(self, description: str) -> List[str]:
        """Parse a description into bullet points"""
        if not description:
            return []
        
        # First escape LaTeX special characters
        description = self._escape_latex(description)
        
        # Split by common delimiters
        lines = re.split(r'[\n\r•]|(?<=[.!?])\s+', description)
        
        # Clean and filter
        bullets = []
        for line in lines:
            line = line.strip()
            # Remove leading dashes or asterisks
            line = re.sub(r'^[\-\*]+\s*', '', line)
            if line and len(line) > 10:  # Minimum meaningful length
                # Ensure first letter is capitalized
                line = line[0].upper() + line[1:] if line else line
                # Ensure ends with period
                if line and not line.endswith(('.', '!', '?')):
                    line += '.'
                bullets.append(line)
        
        # Limit number of bullets
        return bullets[:4]
    
    def generate_cv(
        self,
        profile: Dict,
        skills: List[Dict] = None,
        work_experiences: List[Dict] = None,
        certifications: List[Dict] = None,
        awards: List[Dict] = None,
        extra_curriculars: List[Dict] = None,
        github_projects: List[Dict] = None,
    ) -> str:
        """Generate complete LaTeX CV"""
        # Start with preamble and document begin
        latex_parts = [
            self.latex_preamble,
            "\\begin{document}",
            "\\pagestyle{empty}",
        ]
        
        # Always add header
        latex_parts.append(self.generate_header(profile))
        
        # Add optional sections (only if they have content)
        profile_summary = self.generate_profile_summary(profile)
        if profile_summary.strip():
            latex_parts.append(profile_summary)
        
        education = self.generate_education(profile)
        if education.strip():
            latex_parts.append(education)
        
        skills_section = self.generate_skills(skills or [])
        if skills_section.strip():
            latex_parts.append(skills_section)
        
        certs = self.generate_certifications(certifications or [])
        if certs.strip():
            latex_parts.append(certs)
        
        work_exp = self.generate_work_experience(work_experiences or [])
        if work_exp.strip():
            latex_parts.append(work_exp)
        
        projects = self.generate_projects([], github_projects or [])
        if projects.strip():
            latex_parts.append(projects)
        
        awards_section = self.generate_awards(awards or [])
        if awards_section.strip():
            latex_parts.append(awards_section)
        
        extra_curricular = self.generate_extra_curricular(extra_curriculars or [])
        if extra_curricular.strip():
            latex_parts.append(extra_curricular)
        
        # End document
        latex_parts.append("\\end{document}")
        
        return "\n".join(latex_parts)


# Singleton instance
_generator_instance = None


def get_generator() -> LaTeXCVGenerator:
    """Get or create the LaTeX CV generator instance"""
    global _generator_instance
    if _generator_instance is None:
        _generator_instance = LaTeXCVGenerator()
    return _generator_instance
