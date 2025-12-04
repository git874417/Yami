# Dockerfile para el backend

# Usa Python 3.10-slim, necesario para FastAPI
FROM python:3.10-slim

# Establece el directorio de trabajo
WORKDIR /app

# Instala dependencias del sistema necesarias para compilar psycopg2
# (gcc y libpq-dev son necesarios si requirements.txt tiene 'psycopg2' en vez de 'psycopg2-binary')
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Archivo de requisitos
COPY requirements.txt .

# Instala las dependencias del requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código del backend
# Si el contexto de docker-compose es la raíz, usar: COPY src/Backend .
# Si el contexto es la carpeta Backend, usar: COPY . .
COPY src/Backend/ . 

#(FastAPI suele usar puerto 8000)
EXPOSE 8000

# Comando para ejecutar la aplicación usando uvicorn
CMD ["uvicorn", "application:app", "--host", "0.0.0.0", "--port", "8000"]