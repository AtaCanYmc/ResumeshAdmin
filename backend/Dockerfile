FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir -e .

# Configure Playwright browser path to be globally accessible and install chromium dependencies
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN mkdir -p /ms-playwright && \
    playwright install --with-deps chromium && \
    chmod -R 777 /ms-playwright

COPY . .

ENV PYTHONPATH=/app

# Setup non-root user for container security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
