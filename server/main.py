from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from osint_search import shodan_scan
import uvicorn
import os
from pydantic import BaseModel
from Spider import crawl_website


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

# Get OSINT information about a target
@app.get("/osint")
async def osint(target: Target):
    try:
        osint_data = await shodan_scan(target.target)
        return osint_data
    except Exception as e:
        return {"error": str(e)}

# Crawl a website (Active Recon)
@app.post("/crawl")
async def crawl(target: Target):
    try:
        crawled_data = await crawl_website(target.target)
        return crawled_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Load environment variables and start the server
if __name__ == "__main__":
    port = os.getenv("PORT", 5555)
    uvicorn.run(app, host="0.0.0.0", port=port)
    print(f"Starting server on http://127.0.0.1:{port}")