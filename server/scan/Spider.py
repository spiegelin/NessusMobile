import aiohttp
from aiohttp import ClientSession
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

async def crawl_website(url):
    """
    This function crawls a website starting from the given URL.
    It finds all the internal links on the website to make a sitemap.
    It also fetches the `robots.txt` file and analyzes it to get Allow and Disallow rules.

    :param url: The URL of the website to crawl
    :return: A dictionary containing the found endpoints, vulnerabilities, and robots.txt analysis.
    """
    visited = set()  # Set to store visited URLs
    endpoints = []  # List to store found endpoints
    extra_info = []  # Store extra information

    async with aiohttp.ClientSession() as session:
        robots_txt_content = await fetch_robots_txt(url, session)  # Fetch robots.txt
        base_domain = urlparse(url).netloc  # Get the base domain
        domain_name = base_domain.split('.')[-2]  # Extract the domain name (e.g., 'example' from 'example.com')

        # Analyze robots.txt to get Allow and Disallow rules
        robots_analysis = analyze_robots_txt(robots_txt_content)

        async def crawl(current_url):
            if current_url in visited:
                return
            visited.add(current_url)

            print(f"Visiting: {current_url}") 

            # Parse the domain of the current URL
            current_domain = urlparse(current_url).netloc

            # Case 1: URL is from the base domain (scope)
            if base_domain in current_domain:
                try:
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
                    }
                    async with session.get(current_url, headers=headers) as response:
                        if response.status != 200:
                            print(f"Failed to retrieve {current_url}: Status code {response.status}")
                            return
                        
                        text = await response.text()
                        soup = BeautifulSoup(text, 'html.parser')
                        endpoints.append(current_url)

                        # Find links on the page
                        for link in soup.find_all('a', href=True):
                            absolute_link = urljoin(current_url, link['href'])
                            await crawl(absolute_link)

                except Exception as e:
                    print(f"Error crawling {current_url}: {e}")

            # Case 2: URL contains the domain name but is not the base domain
            elif domain_name in current_domain or domain_name in current_url:
                if current_url not in endpoints:
                    print(f"Adding {current_url} to extra_info: Contains the domain name '{domain_name}', but not in base domain scope.")
                    extra_info.append(current_url)

            # Case 3: URL is completely out of scope
            else:
                print(f"Skipping {current_url}: Out of scope")

        await crawl(url)

    return {"endpoints": endpoints, "robots_txt": robots_analysis, "extra_info": extra_info}

async def fetch_robots_txt(url, session: ClientSession):
    parsed_url = urlparse(url)
    robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3'
        }
        async with session.get(robots_url, headers=headers) as response:
            if response.status == 200:
                print(f"Fetched robots.txt from {robots_url}")
                return await response.text()
            else:
                print(f"No robots.txt found at {robots_url}: Status code {response.status}")
                return None
    except aiohttp.ClientError as e:
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