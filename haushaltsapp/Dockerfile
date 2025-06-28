FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir flask

# Expose port
EXPOSE 5000

# Start application
CMD ["python", "app.py"]
