# NessusMobile
## Back-End Installation
### .env
Create a `.env` inside of `/server`and add the following:
```zsh
BASE_URL_INTERNETDB=https://internetdb.shodan.io/
BASE_URL_GEONET=https://geonet.shodan.io/api/ping/
BASE_URL_CVE=https://cvedb.shodan.io/cve/
PORT=8000
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.3"
API_KEY_HUNTER=<API-KEY>
BASE_URL_HUNTER=https://api.hunter.io/v2/
API_KEY_DEHASHED=<API-KEY>
USERNAME_DEHASHED=<username>

# Contenedores
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<pass>
POSTGRES_DB=<name>

OPENVAS_USER=<user>
OPENVAS_PASSWORD=<pass>
OPENVAS_URL=https://openvas-scanner:9391
OPENVAS_PORT=9390

NESSUS_ACTIVATION_CODE=<YOUR-ACTIVATION-CODE>
VERSION_OS=latest-ubuntu

PORTBACK=3000

ZAP_API_KEY=<Something-random>
ZAP_BASE_URL=http://zap-scanner:8090

OPENAI_API_KEY=<API-KEY>
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

### SSL Certificate via Cloudflare
**For this you will need a valid domain**
1. Create a Cloudflare account [here](https://www.cloudflare.com/), add your domain and update the nameservers with the ones given by Cloudflare.


2. Install `cloudflared`:
```bash
sudo apt install cloudflared
brew install cloudflared
```

3. Login to your Cloudflare account:
```bash
cloudflared tunnel login 
```

4. Create a tunnel:
```bash
cloudflared tunnel create <NAME>
```

5. Confirm that the tunnel has been successfully created by running:
```bash
cloudflared tunnel list
```

6. Create a configuration "`config.yml`" file inside of `.cloudflared` directory:
```bash
nano ~/.cloudflared/config.yml
```

7. Add the following:
```bash
url: http://localhost:<PORT-TO-FORWARD>
tunnel: <Tunnel-UUID>
credentials-file: ~/.cloudflared/<Tunnel-UUID>.json
```

8. Assign a CNAME record that points traffic to your tunnel subdomain:
```bash
cloudflared tunnel route dns <UUID> <hostname>
```

9. Run the tunnel to proxy incoming traffic from the tunnel to any service running locally:
```bash
cloudflared tunnel run <UUID>
```

10.  Visit your subdomain and confirm.
