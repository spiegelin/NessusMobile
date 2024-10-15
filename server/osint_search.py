from dotenv import load_dotenv
import requests
import os
import sys
import socket

# Load the environment variables
load_dotenv()
#SHODAN_API_KEY = os.getenv("API_KEY_SHODAN")
#INTERNET_DB_URL = os.getenv("BASE_URL_INTERNETDB")
#GEONET_URL = os.getenv("BASE_URL_GEONET")
#CVE_DB_URL = os.getenv("BASE_URL_CVE")


async def shodan_scan(ip_or_domain: str):
    # Resolve the domain to an IP address (if given a domain)
    ip_address = resolve_domain(ip_or_domain)
    print("IP: ", ip_address)

    # Searcg OSINT info from Shodan
    internetdb_url = f"https://internetdb.shodan.io/{ip_address}"
    geonet_url = f"https://geonet.shodan.io/api/ping/{ip_address}"
    try:
        # Obtain open ports, hosts and vulns from the InternetDB API
        response = requests.get(internetdb_url)
        host_info = response.json()

        # Obtain geolocation information from the GeoNet API
        response = requests.get(geonet_url)
        geonet_info = response.json()

        # Check if the host has vulnerabilities
        if "vulns" in host_info:
            print("Vulns: ", host_info["vulns"])
            cve_list = host_info["vulns"]
            vulnerabilities_info = []

            # Obtain information about each vulnerability from the CVE DB API
            for cve_id in cve_list:
                cve_info_url = f"https://cvedb.shodan.io/cve/{cve_id}"
                cve_response = requests.get(cve_info_url)
                cve_info = cve_response.json()

                vulnerability_details = {
                    "cve_id": cve_info.get("cve_id"),
                    "cvss": cve_info.get("cvss"),
                    "published_time": cve_info.get("published_time"),
                    "summary": cve_info.get("summary")
                }

                vulnerabilities_info.append(vulnerability_details)

            return {
                "ip": host_info.get("ip"),
                "hostnames": host_info.get("hostnames"),
                "ports": host_info.get("ports"),
                "city": geonet_info.get("from_loc").get("city"),
                "country": geonet_info.get("from_loc").get("country"),
                "latlon": geonet_info.get("from_loc").get("latlon"),
                "vulnerabilities": vulnerabilities_info
            }
        else:
            return {"message": "No vulnerabilities found for this IP address."}

    except Exception as e:
        raise Exception(status_code=500, detail=str(e))

def resolve_domain(domain: str):
    """Resolves a domain to an IP address using socket"""
    try:
        ip = socket.gethostbyname(domain)
        return ip
    except socket.gaierror:
        raise Exception(status_code=400, detail="Invalid domain or unable to resolve")