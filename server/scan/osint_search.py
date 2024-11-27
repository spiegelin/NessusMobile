from dotenv import load_dotenv
import requests
import os
import sys
import socket
import asyncio
from socket import gaierror
import aiohttp
from typing import Optional
import httpx

# Load the environment variables
load_dotenv()
#SHODAN_API_KEY = os.getenv("API_KEY_SHODAN")
#INTERNET_DB_URL = os.getenv("BASE_URL_INTERNETDB")
#GEONET_URL = os.getenv("BASE_URL_GEONET")
#CVE_DB_URL = os.getenv("BASE_URL_CVE")
HUNTER_API_KEY = os.getenv("API_KEY_HUNTER")
HUNTER_URL = os.getenv("BASE_URL_HUNTER")
DEHASHED_API_KEY = os.getenv("API_KEY_DEHASHED")
DEHASHED_USERNAME = os.getenv("USERNAME_DEHASHED")


async def shodan_scan(ip_or_domain: str) -> Optional[dict]:
    """
    Perform a Shodan scan asynchronously to gather OSINT information.
    :param ip_or_domain: The IP address or domain to scan.
    :return: A dictionary containing OSINT information or a message if no vulnerabilities are found.
    """
    ip_address = ip_or_domain
    if not ip_or_domain.replace('.', '').isdigit():  # Check if it's a domain
        ip_address = await resolve_domain(ip_or_domain)

    print("IP: ", ip_address)

    internetdb_url = f"https://internetdb.shodan.io/{ip_address}"
    geonet_url = f"https://geonet.shodan.io/api/ping/{ip_address}"

    async with aiohttp.ClientSession() as session:
        try:
            # Fetch host info from InternetDB API
            async with session.get(internetdb_url) as response:
                host_info = await response.json()

            # Fetch geolocation info from GeoNet API
            async with session.get(geonet_url) as response:
                geonet_info = await response.json()

            vulnerabilities_info = []

            # Check if the host has vulnerabilities
            if "vulns" in host_info:
                print("Vulns: ", host_info["vulns"])
                cve_list = host_info["vulns"]

                for cve_id in cve_list:
                    cve_info_url = f"https://cvedb.shodan.io/cve/{cve_id}"
                    async with session.get(cve_info_url) as cve_response:
                        cve_info = await cve_response.json()
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

        except aiohttp.ClientError as e:
            raise Exception(f"Failed to perform Shodan scan: {e}")


async def socials_discovery(domain: str):
    """
    Discovers social media profiles, emails, and other organizational information 
    using the Hunter API asynchronously.
    """
    hunter_url = f"{HUNTER_URL}/domain-search?domain={domain}&api_key={HUNTER_API_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(hunter_url)
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
        raise Exception(f"Error: {str(e)}")


async def find_passwords(email: str):
    """
    Search for passwords and hashes using the Dehashed API asynchronously.
    """
    url = f"https://api.dehashed.com/search?query={email}"

    # Prepare the headers for Basic Authentication
    headers = {
        "Accept": "application/json",
    }

    try:
        # Use an async client for the request
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, auth=(DEHASHED_USERNAME, DEHASHED_API_KEY))

            # Check for successful response
            if response.status_code == 200:
                data = response.json()
                print(data)
                return data
            else:
                print(f"Error: {response.status_code}, {response.text}")
                return {"error": response.status_code, "message": response.text}

    except httpx.RequestError as e:
        # Handle request errors
        raise Exception(f"An error occurred while making the request: {str(e)}")

async def resolve_domain(domain: str) -> str:
    """
    Resolves a domain to an IP address asynchronously using asyncio and getaddrinfo.
    :param domain: The domain to resolve.
    :return: The resolved IP address as a string.
    """
    try:
        loop = asyncio.get_event_loop()
        result = await loop.getaddrinfo(domain, None)
        return result[0][4][0]  # Extract the resolved IP address from the result
    except gaierror:
        raise Exception("Invalid domain or unable to resolve")
    
    
async def main(ip_or_domain, domain, email):
    # Ejecutar las funciones asincrónicamente y en paralelo
    shodan_task = shodan_scan(ip_or_domain)
    socials_task = socials_discovery(domain)
    passwords_task = find_passwords(email)

    # Ejecuta las tareas de forma concurrente y espera a que todas finalicen
    results = await asyncio.gather(shodan_task, socials_task, passwords_task, return_exceptions=True)

    # Manejo de resultados
    shodan_result, socials_result, passwords_result = results

    if isinstance(shodan_result, Exception):
        print("Error en shodan_scan:", shodan_result)
    else:
        print("Resultado de shodan_scan:", shodan_result)

    if isinstance(socials_result, Exception):
        print("Error en socials_discovery:", socials_result)
    else:
        print("Resultado de socials_discovery:", socials_result)

    if isinstance(passwords_result, Exception):
        print("Error en find_passwords:", passwords_result)
    else:
        print("Resultado de find_passwords:", passwords_result)

# Para ejecutar el main asincrónicamente
if __name__ == "__main__":
    ip_or_domain = "example.com"
    domain = "example.com"
    email = "user@example.com"

    # Ejecuta el evento principal
    asyncio.run(main(ip_or_domain, domain, email))
