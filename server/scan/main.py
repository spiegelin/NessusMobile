#from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from osint_search import shodan_scan, socials_discovery, find_passwords
import uvicorn
import os
from pydantic import BaseModel
from typing import Optional
from Spider import crawl_website
from openvas_scanner import openvas_scan
from zap_scanner import zap_scan
from ai_sol import process_vulnerabilities

# uvicorn main:app --reload


app = FastAPI()

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

class OpenAIData(BaseModel):
    scan_id: int
    cwe_id: Optional[str] = None 
    alert: Optional[str] = None 
    riskdesc: Optional[str] = None
    desc: Optional[str] = None
    cve_id: Optional[str] = None
    cvss: Optional[float] = None

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
    
# Get passwords and hashes from an associated email/domain
@app.post("/passwords")
async def passwords(target: Target):
    try:
        passwords_data = await find_passwords(target.target)
        return passwords_data
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

# Scan a target IP based on the provided scan type via the key
# http://127.0.0.1:8000/scan?scan_type=host_discovery
# http://127.0.0.1:8000/scan?scan_type=basic
# http://127.0.0.1:8000/scan?scan_type=malware
@app.post("/scan")
async def scan(target: Target, scan_type: str = Query(..., description="Type of scan to perform")):
    """
    Endpoint to scan a target IP based on the provided scan type.
    """
    try:
        # Call the scan function with the target and scan type
        print("Scanning target: ", target.target)
        scan_data = openvas_scan(target.target, scan_type)
        return scan_data
    except Exception as e:
        # Return an error response in case of an exception
        return {"error": str(e)}

# Scan a web application using OWASP ZAP
@app.post("/web-scan")
async def web_scan(target: Target):
    try:
        # Perform the scan
        scan_data = await zap_scan(target.target)
        return scan_data
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/process-link")
async def process_link(link: str):
    # Process the link here
    return {"message": f"Processing {link}"}

@app.post("/ai-solutions")
async def ai_solutions(data: OpenAIData):
    try:
        data = data.dict()
        # Process the vulnerabilities
        processed_data = await process_vulnerabilities(data)
        return {"success": True,  
                "data": processed_data}
    except Exception as e:
        return {"error": str(e)}

# Load environment variables and start the server
if __name__ == "__main__":
    port = os.getenv("PORT", 5555)
    uvicorn.run(app, host="0.0.0.0", port=port)
    print(f"Starting server on http://127.0.0.1:{port}")