from nessus import authenticate, validate_session, create_scan, check_scan_status, export_scan, get_valid_token
import asyncio

async def test_authenticate():
    try:
        token = await authenticate()
        print(f"Token obtenido: {token}")
        return token
    except Exception as e:
        print(f"Error durante la autenticación: {e}")

# Ejecutar prueba
#asyncio.run(test_authenticate())

async def test_validate_session():
    try:
        token = await authenticate()
        is_valid = await validate_session(token)
        print(f"¿El token es válido? {is_valid}")
    except Exception as e:
        print(f"Error durante la validación del token: {e}")

# Ejecutar prueba
#asyncio.run(test_validate_session())


async def test_create_scan():
    try:
        token = await authenticate()
        scan_response = await create_scan(token, "host_discovery", "192.168.1.1")
        print(f"Escaneo creado: {scan_response}")
    except Exception as e:
        print(f"Error al crear el escaneo: {e}")

# Ejecutar prueba
#asyncio.run(test_create_scan())

async def test_check_scan_status():
    try:
        token = await authenticate()
        scan_response = await create_scan(token, "host_discovery", "192.168.0.0/24")
        scan_id = scan_response["scan"]["id"]

        status, progress = await check_scan_status(token, scan_id)
        print(f"Estado del escaneo: {status}, Progreso: {progress}%")
    except Exception as e:
        print(f"Error al verificar el estado del escaneo: {e}")

# Ejecutar prueba
#asyncio.run(test_check_scan_status())

async def test_export_scan():
    try:
        token = await authenticate()
        scan_response = await create_scan(token, "host_discovery", "192.168.0.0/24")
        scan_id = scan_response["scan"]["id"]

        # Esperar a que el escaneo termine (simulamos espera)
        while True:
            status, progress = await check_scan_status(token, scan_id)
            print(f"Estado: {status}, Progreso: {progress}%")
            if status == "completed":
                break
            await asyncio.sleep(10)  # Espera antes de volver a comprobar

        # Exportar y guardar el reporte
        report_content = await export_scan(token, scan_id)
        with open("reporte.pdf", "wb") as file:
            file.write(report_content)
        print("Reporte descargado: reporte.pdf")
    except Exception as e:
        print(f"Error al exportar el escaneo: {e}")

# Ejecutar prueba
#asyncio.run(test_export_scan())

async def test_full_flow():
    try:
        token = await get_valid_token()
        print("Token válido obtenido: ", token)

        # Crear un escaneo
        scan_response = await create_scan(token, "host_discovery", "192.168.0.0/24")
        scan_id = scan_response["scan"]["id"]
        print(f"Escaneo creado con ID: {scan_id}")

        # Esperar a que termine
        while True:
            status, progress = await check_scan_status(token, scan_id)
            print(f"Estado: {status}, Progreso: {progress}%")
            if status == "completed":
                break
            await asyncio.sleep(10)

        # Descargar el reporte
        report_content = await export_scan(token, scan_id)
        with open("web_scan_report.pdf", "wb") as file:
            file.write(report_content)
        print("Reporte descargado: web_scan_report.pdf")
    except Exception as e:
        print(f"Error en el flujo completo: {e}")

# Ejecutar prueba
asyncio.run(test_full_flow())
