import asyncio
from dotenv import load_dotenv
load_dotenv()
from app.chains.scoring_chain import score_resume

async def main():
    job_title = "Frontend Developer"
    job_req = "React.js, Next.js, 3+ years experience, Bachelor's degree"
    resume = {
        "name": "John Doe",
        "skills": ["React.js", "Javascript", "HTML", "CSS", "Bootstrap", "Axios", "AWS", "Docker", "Kubernetes"],
        "experience": [{"position": "Frontend Eng", "company": "Tech", "duration": "4 years", "description": "Built things"}],
        "education": [{"degree": "BS CS", "institution": "Uni"}]
    }
    
    try:
        res = await score_resume(job_title, job_req, resume)
        print("Success:")
        import json
        print(json.dumps(res, indent=2))
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(main())
