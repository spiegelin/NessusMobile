from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from osint_search import shodan_scan, socials_discovery
import uvicorn
import os
from pydantic import BaseModel
from Spider import crawl_website


app = FastAPI()

"""
@app.post("/scan")
async def perform_scan(target: str):
    try:
        scan_id = create_nessus_scan(target)
        return {"message": "Scan initiated", "scan_id": scan_id}
    except Exception as e:
        return {"error": str(e)}

@app.get("/scan/{scan_id}")
async def get_report(scan_id: int):
    try:
        report = get_nessus_scan_report(scan_id)
        recommendations = get_vulnerability_recommendations(report)
        return {"vulnerabilities": report, "recommendations": recommendations}
    except Exception as e:
        return {"error": str(e)}
"""

# Health check GET endpoint
@app.get("/health")
async def health():
    return {"status": "ok"}

# Health check POST endpoint
@app.post("/health")
async def health():
    return {"status": "ok"}

# Model for the request body
class Target(BaseModel):
    target: str

# Get OSINT information about a target
@app.get("/osint")
async def osint(target: Target):
    try:
        osint_data = await shodan_scan(target.target)
        return osint_data
    except Exception as e:
        return {"error": str(e)}
    
# Get email and socials via domain
@app.post("/socials")
async def socials(target: Target):
    try:
        socials_data = await socials_discovery(target.target)
        return socials_data
    except Exception as e:
        return {"error": str(e)}

# Crawl a website (Active Recon)
@app.post("/crawl")
async def crawl(target: Target):
    try:
        print("----------------------------------------------------------------------")
        print("Crawling website...")
        print("Target: ", target.target)
        print("Remember this is an ACTIVE recon technique and may be illegal!!!!")
        print("----------------------------------------------------------------------")
        crawled_data = await crawl_website(target.target)
        print("*******Finished crawling website*******")
        print("Crawled data: ", crawled_data)
        return crawled_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Load environment variables and start the server
if __name__ == "__main__":
    port = os.getenv("PORT", 5555)
    uvicorn.run(app, host="0.0.0.0", port=port)
    print(f"Starting server on http://127.0.0.1:{port}")