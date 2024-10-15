import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import asyncio

async def crawl_website(url):
    """
    This function crawls a website starting from the given URL.
    It finds all the internal links on the website and checks for common vulnerabilities:
    - SQL Injection
    - Cross-Site Scripting (XSS)
    - Insecure Direct Object Reference (IDOR)
    - Cross-Site Request Forgery (CSRF)
    - Security Misconfiguration
    - Sensitive Data Exposure.

    It also fetches the `robots.txt` file and analyzes it to get Allow and Disallow rules.

    :param url: The URL of the website to crawl
    :return: A dictionary containing the found endpoints, vulnerabilities, and robots.txt analysis
    """
    visited = set()  # Set to store visited URLs
    vulnerabilities = {
        "SQL Injection": [],
        "Cross-Site Scripting (XSS)": [],
        "Insecure Direct Object Reference (IDOR)": [],
        "Cross-Site Request Forgery (CSRF)": [],
        "Security Misconfiguration": [],
        "Sensitive Data Exposure": []
    }  # Dictionary to store found vulnerabilities by category
    endpoints = []  # List to store found endpoints
    robots_txt_content = await fetch_robots_txt(url)  # Fetch robots.txt
    #base_domain = urlparse(url).netloc  # Get the base domain

    # Analyze robots.txt to get Allow and Disallow rules
    robots_analysis = analyze_robots_txt(robots_txt_content)

    async def crawl(current_url):
        if current_url in visited:
            return
        visited.add(current_url)

        print(f"Visiting: {current_url}") 

        # Check if the URL belongs to the same domain (or not in scope)
        if not is_same_domain(url, current_url):
            print(f"Skipping {current_url}: Not in the same domain") 
            return

        try:
            # Change the User-Agent to avoid being blocked by some websites
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
            }
            response = requests.get(current_url, headers=headers)
            if response.status_code != 200:
                print(f"Failed to retrieve {current_url}: Status code {response.status_code}")
                return
            
            soup = BeautifulSoup(response.text, 'html.parser')
            endpoints.append(current_url)

            # Find links on the page
            for link in soup.find_all('a', href=True):
                absolute_link = urljoin(current_url, link['href'])
                await crawl(absolute_link)

            # Check for common vulnerabilities
            if check_sql_injection(current_url):
                vulnerabilities["SQL Injection"].append(current_url)
                print(f"SQL Injection vulnerability found at: {current_url}") 

            if check_xss(current_url):
                vulnerabilities["Cross-Site Scripting (XSS)"].append(current_url)
                print(f"XSS vulnerability found at: {current_url}")
            if check_idor(current_url):
                vulnerabilities["Insecure Direct Object Reference (IDOR)"].append(current_url)
                print(f"IDOR vulnerability found at: {current_url}")

            if check_csrf(current_url):
                vulnerabilities["Cross-Site Request Forgery (CSRF)"].append(current_url)
                print(f"CSRF vulnerability found at: {current_url}")

            if check_security_misconfiguration(current_url):
                vulnerabilities["Security Misconfiguration"].append(current_url)
                print(f"Security Misconfiguration found at: {current_url}")

            if check_sensitive_data_exposure(current_url):
                vulnerabilities["Sensitive Data Exposure"].append(current_url)
                print(f"Sensitive Data Exposure found at: {current_url}")

        except Exception as e:
            print(f"Error crawling {current_url}: {e}")

    await crawl(url)

    return {
        "endpoints": endpoints,
        "vulns": vulnerabilities,
        "robots_txt": robots_analysis
    }

async def fetch_robots_txt(url):
    parsed_url = urlparse(url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    try:
        # Change the User-Agent to avoid being blocked by some websites
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
        }
        response = requests.get(robots_url, headers=headers)
        if response.status_code == 200:
            print(f"Fetched robots.txt from {robots_url}")
            return response.text
        else:
            print(f"No robots.txt found at {robots_url}: Status code {response.status_code}")
            return None
    except requests.RequestException as e:
        print(f"Error fetching robots.txt: {e}")
        return None

def analyze_robots_txt(robots_txt):
    """
    Function to analyze the contents of a robots.txt file.
    :param robots_txt: The content of the robots.txt file
    :return: A dictionary containing the Allow and Disallow rules
    """
    allow = []
    disallow = []
    if robots_txt:
        lines = robots_txt.splitlines()
        for line in lines:
            if line.startswith("Allow:"):
                allow.append(line.split(":")[1].strip())
            elif line.startswith("Disallow:"):
                disallow.append(line.split(":")[1].strip())
    return {
        "Allow": allow,
        "Disallow": disallow
    }

def is_same_domain(base_url, current_url):
    """
    Function to check if the current URL belongs to the same domain as the base URL.
    - It uses the base domain to compare with the current domain.
    - If the current domain starts with "www.", it is also considered the same domain.

    Example: is_same_domain("https://example.com", "https://www.example.com/page")
    Returns: True

    Example: is_same_domain("https://example.com", "https://another.com/page")
    Returns: False

    Example: is_same_domain("https://example.com", "https://sub.example.com/page")
    Returns: False

    :param base_url: The base URL
    :param current_url: The current URL to check
    :return: True if the current URL belongs to the same domain, False otherwise
    """
    base_domain = urlparse(base_url).netloc
    current_domain = urlparse(current_url).netloc
    return current_domain == base_domain or current_domain.startswith(f"www.{base_domain}")

def check_sql_injection(url):
    # List of common SQL injection payloads
    sql_payloads = [
        "' OR '1'='1",
        #"'; DROP TABLE users; --",
        #'" OR "1"="1" --',
        "' UNION SELECT username, password FROM users --"
    ]

    for payload in sql_payloads:
        test_url = f"{url}?param={payload}"
        print(f"Testing SQL Injection with payload: {payload} on {test_url}") 
        try:
            response = requests.get(test_url)
            if "error" in response.text.lower() or "mysql" in response.text.lower():
                print(f"Potential SQL Injection vulnerability detected at: {url}") 
                return True
        except requests.RequestException as e:
            print(f"Error checking SQL injection: {e}")
    
    return False

def check_xss(url):
    # List of common XSS payloads
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg/onload=alert('XSS')>",
        "<iframe src='javascript:alert(1)'></iframe>"
    ]

    for payload in xss_payloads:
        test_url = f"{url}?param={payload}"
        print(f"Testing XSS with payload: {payload} on {test_url}") 
        try:
            response = requests.get(test_url)
            if payload in response.text:
                print(f"Potential XSS vulnerability detected at: {url}") 
                return True
        except requests.RequestException as e:
            print(f"Error checking XSS: {e}")

    return False

def check_idor(url):
    # This is a very basic check for IDOR
    test_id = 1  # Example ID, maybe adjust based on the application's context?
    test_url = f"{url}/resource/{test_id}"
    print(f"Testing IDOR with URL: {test_url}") 
    try:
        response = requests.get(test_url)
        if response.status_code == 200:
            print(f"IDOR vulnerability detected at: {url}") 
            return True
    except requests.RequestException as e:
        print(f"Error checking IDOR: {e}")

    return False

def check_csrf(url):
    # Simple check for CSRF vulnerabilities
    csrf_url = f"{url}/submit"  # Example URL for submission
    print(f"Testing CSRF vulnerability at: {csrf_url}") 
    try:
        response = requests.get(csrf_url)
        if response.status_code == 200 and "csrf" in response.text.lower():
            print(f"CSRF vulnerability detected at: {url}") 
            return True
    except requests.RequestException as e:
        print(f"Error checking CSRF: {e}")

    return False

def check_security_misconfiguration(url):
    # Very basic check for security misconfigurations
    print(f"Checking security misconfiguration at: {url}")
    try:
        response = requests.get(url)
        if "server" in response.headers and "apache" in response.headers["server"].lower():
            print(f"Security misconfiguration detected at: {url}")
            return True
    except requests.RequestException as e:
        print(f"Error checking security misconfiguration: {e}")

    return False

def check_sensitive_data_exposure(url):
    # Simple check for sensitive data exposure
    print(f"Checking for sensitive data exposure at: {url}")
    try:
        response = requests.get(url)
        if "password" in response.text.lower() or "secret" in response.text.lower():
            print(f"Sensitive data exposure detected at: {url}")
            return True
    except requests.RequestException as e:
        print(f"Error checking sensitive data exposure: {e}")

    return False
