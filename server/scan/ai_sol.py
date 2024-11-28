import openai
import os

# Configurar clave de API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Función para generar una solución usando OpenAI de manera asíncrona
async def generate_solution(scan_id, vulnerability):
    if scan_id == 1:
        # Si el scan_id es 1, incluimos los campos cwe_id, alert, riskdesc y desc
        prompt = f"""
        La siguiente vulnerabilidad fue detectada durante un análisis de seguridad en un sitio web:

        - CWE ID: {vulnerability['cwe_id']}
        - Vulnerabilidad: {vulnerability['alert']}
        - Nivel de Riesgo: {vulnerability['riskdesc']}
        - Descripción: {vulnerability['desc']}

        Por favor, proporciona una recomendación detallada en español para mitigar esta vulnerabilidad de forma efectiva.
        
        Pero por favor intenta que sea en un par de líneas máximo 3 renglones, no hagas párrafos enormes, ni listas, ni nada, solo texto puro.
        """
    elif scan_id == 2:
        # Si el scan_id es 2, incluimos los campos desc, cve_id y cvss
        prompt = f"""
        La siguiente vulnerabilidad fue detectada durante un análisis de seguridad en un sitio web:

        - CVE ID: {vulnerability['cve_id']}
        - Nivel CVSS: {vulnerability['cvss']}
        - Descripción: {vulnerability['desc']}

        Por favor, proporciona una recomendación detallada en español para mitigar esta vulnerabilidad de forma efectiva.
        
        Pero por favor intenta que sea en un par de líneas máximo 3 renglones, no hagas párrafos enormes, ni listas, ni nada, solo texto puro.
        """
    else:
        # Si el scan_id no es válido, retornamos None
        return None
    
    try:
        response = await openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un asistente experto en ciberseguridad."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=600,
            temperature=0.7
        )
        
        # Obtener y retornar la solución generada por OpenAI
        ai_solution = response.choices[0].message.content.strip()
        return ai_solution

    except Exception as e:
        print(f"Error while generating solution: {e}")
        return None  # Retornar None si hay algún error

# Función para procesar la vulnerabilidad y retornar la solución generada
async def process_vulnerabilities(data):
    # Leer el valor de scan_id
    scan_id = data.get("scan_id")
    
    # Generar la solución usando el scan_id correspondiente
    ai_solution = await generate_solution(scan_id, data)

    # Retornar la solución generada por OpenAI
    return ai_solution
