# NessusMobile
## Back-End Installation
### .env
Create a `.env` inside of `/server`and add the following:
```zsh
#  Containers
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<pass>
POSTGRES_DB=<db_name>
NESSUS_USERNAME=<user>
NESSUS_PASSWORD=<pass>
NESSUS_ACTIVATION_CODE=<####-...>
VERSION_OS=<latest-ubuntu> # Or your choice

API_KEY_SHODAN=<API_KEY>
BASE_URL_INTERNETDB=https://internetdb.shodan.io/
BASE_URL_GEONET=https://geonet.shodan.io/api/ping/
BASE_URL_CVE=https://cvedb.shodan.io/cve/
PORT=8000
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3" # Or your choosing
API_KEY_HUNTER=<API_KEY>
BASE_URL_HUNTER=https://api.hunter.io/v2/
API_KEY_DEHASHED=<API_KEY>
USERNAME_DEHASHED=<username>
```

### Docker Compose Setup
Download the images and build the backend service:
```bash
docker-compose build
```

Run the services:
```bash
docker-compose up -d
```

Verify:
```bash
docker-compose ps
```

Stop services:
```bash
docker-compose down
```