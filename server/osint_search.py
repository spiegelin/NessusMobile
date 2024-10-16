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
HUNTER_API_KEY = os.getenv("API_KEY_HUNTER")
HUNTER_URL = os.getenv("BASE_URL_HUNTER")


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

async def socials_discovery(domain: str):
    # Search for emails and social media profiles using the Hunter API
    hunter_url = f"{HUNTER_URL}/domain-search?domain={domain}&api_key={HUNTER_API_KEY}"
    try:
        response = requests.get(hunter_url)
        response.raise_for_status()  # Verifies if the request was successful
        hunter_info = response.json()

        employees_dict = {}
        for email_entry in hunter_info.get('data', {}).get('emails', []):
            # Create a unique key for each employee
            employee_key = f"{email_entry.get('first_name', '')} {email_entry.get('last_name', '')} {email_entry.get('position', '')}".strip()

            # If the employee is not in the dictionary, add it
            if employee_key not in employees_dict:
                employees_dict[employee_key] = {
                    "name": f"{email_entry.get('first_name', '')} {email_entry.get('last_name', '')}".strip(),
                    "emails": [],
                    "position": email_entry.get('position'),
                    "seniority": email_entry.get('seniority'),
                    "department": email_entry.get('department'),
                    "phone_number": email_entry.get('phone_number'),
                    "socials": {
                        "linkedin": email_entry.get('linkedin'),
                        "twitter": email_entry.get('twitter')
                    },
                    "sources": []
                }

            # Add email and sources to the employee
            employees_dict[employee_key]["emails"].append(email_entry.get('value'))
            employees_dict[employee_key]["sources"].extend(email_entry.get('sources', []))
        
        # Convert the dictionary to a list
        employees_list = list(employees_dict.values())
       
        return {
            "organization_info": {
                "domain": hunter_info.get("data").get("domain"),
                "name": hunter_info.get("data").get("organization"),
                "description": hunter_info.get("data").get("description"),
                "industry": hunter_info.get("data").get("industry") + " - " + hunter_info.get("data").get("company_type"),
                "size": hunter_info.get("data").get("headcount"),
                "twitter": hunter_info.get("data").get("twitter"),
                "facebook": hunter_info.get("data").get("facebook"),
                "linkedin": hunter_info.get("data").get("linkedin"),
                "instagram": hunter_info.get("data").get("instagram"),
                "country": hunter_info.get("data").get("country"),
                "state": hunter_info.get("data").get("state"),
                "city": hunter_info.get("data").get("city"),
                "postal_code": hunter_info.get("data").get("postal_code"),
                "street": hunter_info.get("data").get("street"),
            }, 
            "employees": employees_list,
            "tech_stack": hunter_info.get("data").get("technologies"),
            "linked_domains": hunter_info.get("data").get("linked_domains"),
            "total": hunter_info.get("meta").get("results")
        }
    except Exception as e:
        raise Exception(status_code=500, detail=str(e))
        

def resolve_domain(domain: str):
    """Resolves a domain to an IP address using socket"""
    try:
        ip = socket.gethostbyname(domain)
        return ip
    except socket.gaierror:
        raise Exception(status_code=400, detail="Invalid domain or unable to resolve")