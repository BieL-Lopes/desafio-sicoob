# ============================================
# Stage 1: Instalar dependências
# ============================================
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ============================================
# Stage 2: Runtime enxuto
# ============================================
FROM python:3.12-slim AS production

WORKDIR /app

# Copia apenas os pacotes instalados do stage anterior
COPY --from=builder /install /usr/local

# Copia código do backend
COPY . .

# Cria diretório para o banco SQLite
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
