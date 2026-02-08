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

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (Hugging Face uses 7860)
EXPOSE 7860

# Command to run the application with increased timeout for model loading
# We use 0.0.0.0 to make it accessible outside the container
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "--timeout", "300", "--workers", "1", "app:app"]
