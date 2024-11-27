import asyncio
from zapv2 import ZAPv2
from dotenv import load_dotenv
import os
from concurrent.futures import ThreadPoolExecutor
import json

# Cargar variables de entorno
load_dotenv()
ZAP_API_KEY = os.getenv("ZAP_API_KEY")
ZAP_BASE_URL = os.getenv("ZAP_BASE_URL") 

# URL de la aplicación objetivo
TARGET_URL = 'https://soytutor.io/'

# Inicializar cliente ZAP API
zap = ZAPv2(apikey=ZAP_API_KEY, proxies={'http': ZAP_BASE_URL, 'https': ZAP_BASE_URL})

# Crear un ejecutor de subprocesos para operaciones bloqueantes
executor = ThreadPoolExecutor()

async def run_in_thread(func, *args):
    """
    Ejecuta una función bloqueante en un subproceso.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(executor, func, *args)


async def start_passive_scan(target_url):
    """
    Inicia un escaneo pasivo accediendo a la URL objetivo.
    """
    print(f"[INFO] Starting Passive Scan for: {target_url}")
    await run_in_thread(zap.urlopen, target_url)  # Ejecutar bloqueante en un subproceso
    await asyncio.sleep(2)  # Dar tiempo para que el escáner pasivo analice
    print(f"[INFO] Passive Scan Complete")


async def start_active_scan(target_url):
    """
    Inicia un escaneo activo en la URL objetivo.
    """
    print(f"[INFO] Starting Active Scan for: {target_url}")
    scan_id = await run_in_thread(zap.ascan.scan, target_url)
    
    # Supervisar el progreso del escaneo activo
    while int(await run_in_thread(zap.ascan.status, scan_id)) < 100:
        progress = await run_in_thread(zap.ascan.status, scan_id)
        print(f"[INFO] Active Scan Progress: {progress}%")
        await asyncio.sleep(5)
    
    print(f"[INFO] Active Scan Complete")


async def generate_report(output_file_html='zap_report.html', output_file_json='zap_report.json'):
    """
    Genera un informe de vulnerabilidades y lo guarda en un archivo.
    """
    print(f"[INFO] Generating HTML Report")
    html_report = await run_in_thread(zap.core.htmlreport)
    with open(output_file_html, 'w') as report_file:
        report_file.write(html_report)
    print(f"[SAVED] Report saved to {output_file_html}")

    print(f"[INFO] Generating JSON Report")
    json_report = await run_in_thread(zap.core.jsonreport)
    with open(output_file_json, 'w') as report_file:
        report_file.write(json_report)
    print(f"[SAVED] Report saved to {output_file_json}")


async def zap_scan(target_url):
    """
    Inicia un escaneo completo utilizando ZAP.
    """
    try:
        # Escaneo pasivo
        await start_passive_scan(target_url)

        # Escaneo activo
        await start_active_scan(target_url)

        # Generar informe
        #await generate_report()
        print("[SUCCESS] Scanning Completed Successfully!")
        json_report = await run_in_thread(zap.core.jsonreport)
        return json.loads(json_report)

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        return {"error": str(e)}


# Punto de entrada principal asíncrono
async def main():
    try:
        await zap_scan(TARGET_URL)
    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(main())
