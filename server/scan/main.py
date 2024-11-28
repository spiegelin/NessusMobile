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
import re
import ipaddress

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
        # Accepts an IP or a domain
        target = validate_target(target.target, "ip_or_domain")
        print("Starting Shodan scan for: ", target)
        osint_data = await shodan_scan(target)
        return osint_data
    except Exception as e:
        return {"error": str(e)}
    
# Get email and socials via domain
@app.post("/socials")
async def socials(target: Target):
    try:
        # Only accepts a domain
        target = validate_target(target.target, "domain")
        print("Starting Socials Scan for: ", target)
        socials_data = await socials_discovery(target)
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
        # Only accepts a URL
        target = validate_target(target.target, "url")
        print("Starting to crawl website: ", target)
        crawled_data = await crawl_website(target.target)
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
        # Only accepts an IP or IP range
        if ipaddress.ip_network(target.target, strict=False):
            print("Scanning target: ", target.target)
            scan_data = openvas_scan(target, scan_type)
            return scan_data
        else:
            raise HTTPException(status_code=400, detail="El target debe ser una IP o rango de IP válido.")
    except Exception as e:
        # Return an error response in case of an exception
        return {"error": str(e)}

# Scan a web application using OWASP ZAP
@app.post("/web-scan")
async def web_scan(target: Target):
    try:
        # Accepts a URL
        target = validate_target(target.target, "url")
        print("Starting ZAP scan for: ", target)
        scan_data = await zap_scan(target)
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

# Función auxiliar para validar y ajustar targets
def validate_target(target: str, target_type: str) -> str:
    """
    Valida y ajusta el parámetro target según su tipo esperado.
    """
    def is_valid_ip(ip: str) -> bool:
        ip_pattern = r"^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"  # IPv4
        return re.match(ip_pattern, ip) is not None

    def is_valid_domain(domain: str) -> bool:
        domain_pattern = r"^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$"
        return re.match(domain_pattern, domain) is not None

    if target_type == "domain":
        # Quitar protocolo si es una URL
        if target.startswith("http://") or target.startswith("https://"):
            target = target.split("//", 1)[-1].rstrip("/")
        # Validar como dominio
        if not is_valid_domain(target):
            raise HTTPException(status_code=400, detail="El target debe ser un dominio válido.")
        return target

    if target_type == "ip_or_domain":
        if target.startswith("http://") or target.startswith("https://"):
            target = target.split("//", 1)[-1].rstrip("/")
        # Validar IP o dominio
        if is_valid_ip(target):
            return target
        if not is_valid_domain(target):
            raise HTTPException(status_code=400, detail="El target debe ser una IP o dominio válido.")
        return target
    
    if target_type == "url":
        if target.startswith("http://") or target.startswith("https://"):
            target = target.split("//", 1)[-1].rstrip("/")
        
        if is_valid_ip(target) or is_valid_domain(target):
            return "https://" + target + "/"
        else:
            raise HTTPException(status_code=400, detail="El target debe ser una URL válida.")

    # Si no hay un tipo definido
    raise HTTPException(status_code=400, detail="Tipo de target no soportado.")

# Load environment variables and start the server
if __name__ == "__main__":
    port = os.getenv("PORT", 5555)
    uvicorn.run(app, host="0.0.0.0", port=port)
    print(f"Starting server on http://127.0.0.1:{port}")