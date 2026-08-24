FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Configure Playwright browser path to be globally accessible and install dependencies
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN mkdir -p /ms-playwright && \
    playwright install --with-deps chromium && \
    chmod -R 777 /ms-playwright

COPY . .

ENV PYTHONPATH=/app

# Setup non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
