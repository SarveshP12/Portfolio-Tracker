"""
Simple test server to verify ATS functionality
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
from PyPDF2 import PdfReader

app = FastAPI(title="ATS Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "message": "ATS server running"}

@app.post("/api/ats-check-pdf")
async def ats_check_pdf(
    resume_pdf: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        # Basic validation
        if not resume_pdf.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files supported")
        
        # Read PDF and extract text
        pdf_content = await resume_pdf.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(pdf_content)
            tmp_file_path = tmp_file.name
        
        try:
            reader = PdfReader(tmp_file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            
            # Simple scoring logic for testing
            words = text.lower().split()
            jd_words = job_description.lower().split()
            
            # Count keyword matches
            matches = sum(1 for word in jd_words if word in words)
            total_jd_words = len(jd_words)
            
            score = min(100, (matches / total_jd_words) * 100) if total_jd_words > 0 else 0
            
            # Create simplified response
            return {
                "overall_score": round(score, 1),
                "category": "Good" if score >= 60 else "Needs Improvement",
                "category_description": f"Your resume scored {score:.1f}%",
                "breakdown": {
                    "keyword_match": {
                        "score": score,
                        "matched": matches,
                        "total": total_jd_words,
                        "weight": 1.0
                    },
                    "experience_match": {"score": 70, "weight": 0.2},
                    "formatting": {"score": 80, "weight": 0.15},
                    "semantic_similarity": {"score": 60, "weight": 0.3}
                },
                "extracted_data": {
                    "resume_skills": ["testing"],
                    "jd_skills": ["testing"]
                },
                "recommendations": [{
                    "category": "Test",
                    "priority": "medium",
                    "message": "This is a test response",
                    "details": "ATS system is working"
                }],
                "extracted_info": {
                    "filename": resume_pdf.filename,
                    "text_length": len(text),
                    "word_count": len(words),
                    "page_count": len(reader.pages)
                }
            }
            
        finally:
            os.unlink(tmp_file_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)