"""
Test script for ATS PDF endpoint
"""
import requests

def test_ats_endpoint():
    url = "http://localhost:8000/api/ats-check-pdf"
    
    # Test with text-based job description
    job_description = """
Software Engineer Position

We are looking for a skilled Software Engineer to join our team.

Requirements:
- 3+ years of experience in software development
- Proficiency in JavaScript, TypeScript, React, Node.js
- Experience with Python, FastAPI, PostgreSQL
- Strong problem-solving and communication skills
- Bachelor's degree in Computer Science or related field
- Experience with Git, Docker, AWS
- Knowledge of machine learning and data science is a plus

Responsibilities:
- Develop scalable web applications
- Work with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
    """
    
    # Create a simple text file to simulate PDF (for testing)
    resume_content = """
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development using JavaScript, TypeScript, React, and Node.js. Strong background in Python development and cloud technologies.

EXPERIENCE
Senior Software Engineer - TechCorp (2020 - Present)
- Developed scalable web applications using React and Node.js
- Worked with PostgreSQL databases and AWS cloud services
- Led a team of 5 developers and participated in agile development
- Implemented CI/CD pipelines using Docker and Jenkins

Software Engineer - StartupXYZ (2018 - 2020)
- Built RESTful APIs using Python and FastAPI
- Integrated machine learning models for recommendation systems
- Collaborated with cross-functional teams using Git workflow

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014 - 2018)
GPA: 3.8/4.0

SKILLS
- Programming: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML, CSS
- Backend: Node.js, FastAPI, Django
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS, Docker, Kubernetes
- Tools: Git, Jenkins, Jira
    """
    
    # Save as temporary file
    with open("test_resume.txt", "w") as f:
        f.write(resume_content)
    
    # Test the text-based endpoint first
    text_url = "http://localhost:8001/api/ats-check"
    text_data = {
        "resume_text": resume_content,
        "job_description": job_description
    }
    
    try:
        print("Testing text-based ATS endpoint...")
        response = requests.post(text_url, json=text_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"ATS Score: {result.get('overall_score', 'N/A')}")
            print(f"Category: {result.get('category', 'N/A')}")
            print(f"Keywords matched: {len(result.get('breakdown', {}).get('keyword_match', {}).get('matched', []))}")
            print("✅ Text-based endpoint working!")
        else:
            print(f"❌ Error: {response.text}")
    
    except Exception as e:
        print(f"❌ Error testing text endpoint: {e}")

if __name__ == "__main__":
    test_ats_endpoint()