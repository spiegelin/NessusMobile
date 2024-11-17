# Utiliza una imagen base de Python
FROM python:3.11-slim

# Configura el directorio de trabajo en el contenedor
WORKDIR /nessus-controller

# Copia los archivos de tu proyecto al contenedor
COPY . /nessus-controller

# Instala las dependencias necesarias (asegúrate de tener un archivo requirements.txt)
RUN pip install --no-cache-dir -r /nessus-controller/requirements.txt

# Exponer el puerto 8000, que es el puerto donde FastAPI y Uvicorn escucharán
EXPOSE 8000

# Comando para ejecutar la aplicación con Uvicorn
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]