# Django MFA Application

## Overview
This application provides user registration and multi-factor authentication (MFA) functionality using Django and Django REST Framework. MFA is implemented via email-based OTP (One-Time Password) verification. The application is fully Dockerized for easy setup and deployment.

## Features
- User registration with role-based account creation (User/Author).
- Email-based OTP verification for MFA. (Use valid email address for signup)
- Token-based authentication using JWT.
- Supports `.txt` files only for input processing.

## Prerequisites
Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Step 2: User Registration
```bash
http://localhost:3000/signup
