# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libasound2-dev \
    portaudio19-dev \
    libportaudio2 \
    libportaudiocpp0 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
# (This now includes frontend/dist because we removed it from .gitignore)
COPY . .

# Expose the port the app runs on (Hugging Face uses 7860)
EXPOSE 7860

# Hugging Face Spaces requires running as a non-root user
# Create user and set permissions for writable directories
RUN useradd -m -u 1000 user
RUN mkdir -p /app/static/uploads /app/.cache && \
    chmod -R 777 /app

# Set environment variables for model caching in a writable directory
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV TORCH_HOME=/app/.cache/torch

USER user

# Command to run the application with increased timeout for model loading
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "300", "--workers", "1", "app:app"]
