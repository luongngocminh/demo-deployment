# FastAPI Todo App with SQLite

This is a simple Todo application built with FastAPI and SQLite, containerized with Docker, and ready for deployment using GitHub Actions and SSH.

## Features
- FastAPI backend with CRUD for todos
- SQLite database
- Docker & Docker Compose support
- GitHub Actions workflow for server deployment via SSH

## Local Development

1. **Build and run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
2. Access the API at [http://localhost:8000/docs](http://localhost:8000/docs)

## Deployment

Deployment is automated via GitHub Actions. On push to `main`, the workflow will:
- Copy the project to your server using SSH and rsync
- Rebuild and restart the app with Docker Compose

### Required GitHub Secrets
- `SSH_PRIVATE_KEY`: Your private SSH key for server access
- `SSH_USER`: SSH username
- `SSH_HOST`: Server IP or hostname
- `SSH_TARGET_DIR`: Target directory on the server

## Directory Structure
```
app/
  main.py
  requirements.txt
  Dockerfile
.github/
  workflows/
    deploy.yml
```

## Notes
- The SQLite database file (`todo.db`) is not copied during deployment.
- Ensure Docker and Docker Compose are installed on your server.
