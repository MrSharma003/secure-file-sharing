# Use an official Python image as the base
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the requirements file first to install dependencies
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Set environment variables for Django settings
ENV DJANGO_SETTINGS_MODULE=secure_file_sharing.settings

# Expose the port Django will run on
EXPOSE 8000

# Command to run Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
