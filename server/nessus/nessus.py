from dotenv import load_dotenv
import os
import requests
import aiohttp
import asyncio


# Load the environment variables
load_dotenv()
NESSUS_URL = os.getenv("NESSUS_URL")
NESSUS_USERNAME = os.getenv("NESSUS_USERNAME")
NESSUS_PASSWORD = os.getenv("NESSUS_PASSWORD")

# TO DO: Lo ideal sería un middleware para la autenticación
async def authenticate():
    """
    Autentica al usuario en Nessus y obtiene un token de sesión asíncronamente.

    Retorna:
    - token: Token de sesión autenticado.
    """
    url = f"{NESSUS_URL}/session"
    payload = {"username": NESSUS_USERNAME, "password": NESSUS_PASSWORD}

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, ssl=False) as response:
            if response.status == 200:
                session_data = await response.json()
                print("Autenticación exitosa. Token obtenido.")
                return session_data["token"]
            else:
                print(f"Error en la autenticación: {response.status}")
                raise Exception(f"Failed to authenticate: {response.status}")

async def validate_session(token):
    """
    Verifica si el token de sesión sigue siendo válido de manera asíncrona.

    Parámetros:
    - token: Token de sesión actual.

    Retorna:
    - True si el token es válido, False si no lo es.
    """
    url = f"{NESSUS_URL}/session"
    headers = {"X-Cookie": f"token={token}"}

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, ssl=False) as response:
            if response.status == 200:
                print("El token sigue siendo válido.")
                return True
            else:
                print(f"El token no es válido: {response.status}")
                return False


async def get_valid_token():
    """
    Obtiene un token válido de manera asíncrona. Si el token actual expira, se reautentica.

    Retorna:
    - token: Token de sesión válido.
    """
    global session_token  # Variable global para reutilizar el token
    if not session_token or not await validate_session(session_token):
        session_token = await authenticate()
    return session_token

# Variable global para el token
session_token = None



async def create_scan(token, scan_type, target):
    """
    Crea un escaneo en Nessus basado en el tipo especificado de manera asíncrona.

    Parámetros:
    - token: Token de sesión autenticado.
    - scan_type: Tipo de escaneo (host_discovery, web_application, malware, basic_network).
    - target: Dirección IP, rango o URL objetivo.

    Retorna:
    - Respuesta JSON del escaneo creado.

    Excepciones:
    - Lanza un error si el tipo de escaneo no es válido.
    """
    # Configuración de escaneos
    scan_configs = {
        "host_discovery": {
            "uuid": "bbd4f805-3966-d464-b2d1-0079eb89d69708c3a05ec2812bcf",
            "title": "Host Discovery Scan",
            "name": "discovery",
            "description": "A simple scan to discover live hosts and open ports."
        },
        "web_application": {
            "uuid": "c3cbcd46-329f-a9ed-1077-554f8c2af33d0d44f09d736969bf",
            "title": "Web Application Tests",
            "name": "webapp",
            "description": "Scan for published and unknown web vulnerabilities using Nessus Scanner."
        },
        "malware": {
            "uuid": "d16c51fa-597f-67a8-9add-74d5ab066b49a918400c42a035f7",
            "title": "Malware Scan",
            "name": "malware",
            "description": "Scan for malware on Windows and Unix systems."
        },
        "basic_network": {
            "uuid": "731a8e52-3ea6-a291-ec0a-d2ff0619c19d7bd788d6be818b65",
            "title": "Basic Network Scan",
            "name": "basic",
            "description": "A full system scan suitable for any host."
        }
    }

    # Validar el tipo de escaneo
    if scan_type not in scan_configs:
        raise ValueError(f"Tipo de escaneo no válido: {scan_type}. Opciones: {list(scan_configs.keys())}")

    # Obtener la configuración del escaneo
    config = scan_configs[scan_type]
    url = f"{NESSUS_URL}/scans"
    headers = {"X-Cookie": f"token={token}", "Content-Type": "application/json"}
    payload = {
        "uuid": config["uuid"],
        "settings": {
            "name": config["name"],
            "enabled": "true",
            "text_targets": target,
            "agent_group_id": []
        },
    }

    # Realizar la solicitud asíncrona
    async with aiohttp.ClientSession() as session:
        print("Creando escaneo...")
        print(f"Tipo: {config['name']}, Objetivo: {target}, UUID: {config['uuid']}")
        async with session.post(url, headers=headers, json=payload, ssl=False) as response:
            print(f"Respuesta: {response.status}")
            print(f"Detalles: {await response.text()}")
            if response.status == 200:
                return await response.json()
            else:
                error_message = await response.text()
                raise Exception(f"Error al crear el escaneo: {response.status}, Detalles: {error_message}")



async def check_scan_status(token, scan_id):
    """
    Verifica el estado de un escaneo.

    Parámetros:
    - token: Token de sesión autenticado.
    - scan_id: ID del escaneo.

    Retorna:
    - Estado del escaneo (e.g., "completed", "running").
    """
    url = f"{NESSUS_URL}/scans/{scan_id}"
    headers = {"X-Cookie": f"token={token}"}

    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers, ssl=False) as response:
            if response.status == 200:
                data = await response.json()
                status = data.get("info", {}).get("status", "unknown")
                progress = data.get("info", {}).get("progress", 0)
                return status, progress
            else:
                print(f"Error al verificar el estado: {response.status}")
                raise Exception(f"Failed to check scan status: {response.status}")


async def export_scan(token, scan_id):
    """
    Exporta los resultados de un escaneo y descarga el archivo.

    Parámetros:
    - token: Token de sesión autenticado.
    - scan_id: ID del escaneo.

    Retorna:
    - Contenido del archivo exportado.
    """
    url_export = f"{NESSUS_URL}/scans/{scan_id}/export"
    headers = {"X-Cookie": f"token={token}", "Content-Type": "application/json"}
    payload = {"format": "pdf"}  # Puede ser "pdf", "html", "csv", etc.

    async with aiohttp.ClientSession() as session:
        # Solicitar exportación
        async with session.post(url_export, headers=headers, json=payload, ssl=False) as response:
            if response.status == 200:
                export_data = await response.json()
                file_id = export_data["file"]

                # Descargar archivo exportado
                url_download = f"{NESSUS_URL}/scans/{scan_id}/export/{file_id}/download"
                async with session.get(url_download, headers=headers, ssl=False) as download_response:
                    if download_response.status == 200:
                        return await download_response.read()
                    else:
                        print(f"Error al descargar el reporte: {download_response.status}")
                        raise Exception(f"Failed to download report: {download_response.status}")
            else:
                print(f"Error al exportar el escaneo: {response.status}")
                raise Exception(f"Failed to export scan: {response.status}")


async def main():
    # Obtén un token válido
    token = await get_valid_token()

    # Realiza una validación del token
    is_valid = await validate_session(token)
    if is_valid:
        print("El token está activo y listo para usar.")

# Ejecutar el programa
asyncio.run(main())
