FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY training/ ./training/

# Train the model at build time so the image is self-contained
# (models/*.pkl are not committed to git; training generates them into /app/models)
RUN python training/train_model.py

EXPOSE 8001

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
