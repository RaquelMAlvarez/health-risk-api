# 🧠 Health Risk Predictor API

An API built with **FastAPI** to simulate early risk prediction of lung cancer based on multiple factors such as age, smoking history, pollution exposure, and genetic predisposition.

This project was developed as a practical backend training aligned with real-world health AI use cases.

---

## 🚀 Features

- Predicts lung cancer risk level: **Low**, **Medium**, or **High**.
- Accepts key input factors through a RESTful API.
- Returns a clear medical recommendation based on the risk.
- Simple backend logic designed for learning and internship preparation.
- Clean project structure using FastAPI and SQLite.

---

## 📦 Tech Stack

- **Python 3**
- **FastAPI**
- **Uvicorn** (for running the server)
- **Pydantic** (data validation)
- **SQLite** (optional for persistence)
- **Git + GitHub** (version control)

---

## ▶️ How to Run Locally

1. **Clone the repo**  
```bash
git clone https://github.com/RaquelMAlvarez/health-risk-api.git
cd health-risk-api

2.Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

3.Install dependencies
pip install -r requirements.txt

4.Run the server
uvicorn app.main:app --reload

5.Access the API Docs
Go to 👉 http://127.0.0.1:8000/docs


1.🚀 Deployment on Render
This project has been successfully deployed using Render as a free-tier web service.

📦 Deployment Workflow
Project Structure & Requirements
Ensure your project is structured with:

requirements.txt listing all dependencies (fastapi, uvicorn, pydantic, sqlalchemy).

A start.sh script to launch the app:
#!/bin/bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}


2.Render Blueprint File (render.yaml)
Added to the root to define service configuration:
services:
  - type: web
    name: healthrisk-api
    env: python
    plan: free
    runtime: python
    region: oregon
    buildCommand: "pip install -r requirements.txt"
    startCommand: "bash app/start.sh"
    envVars:
      - key: DATABASE_URL
        value: sqlite:///./patients.db
    branch: main

3.Create Render Account & Connect Repository

Sign up at https://dashboard.render.com.

Create a New Blueprint.

Connect to your GitHub repository and select the branch with the render.yaml.

4.Deploy

Render reads the render.yaml, installs dependencies, and runs your API.

After deployment, the app is accessible via:
🔗 https://healthrisk-api.onrender.com

5.Test Online

API docs: https://healthrisk-api.onrender.com/docs

Test /predict-risk or /patients endpoints using Swagger UI.

This API predicts lung cancer risk based on combined genetic, environmental, and lifestyle factors. Built with FastAPI and secured using JWT authentication, it supports full CRUD operations for managing patient data.

🚀 Features

Risk prediction based on:

Age

Smoking history

Pollution level

Genetic risk indicators

Personalized recommendations

Data persistence with SQLite

JWT-based authentication

Complete CRUD functionality for patient records

📋 Endpoints

🔐 Authentication

POST /token – Obtain JWT token (required for protected endpoints)

🧠 Prediction

POST /predict-risk – Predicts a patient’s lung cancer risk level

🗃️ Patient Management (CRUD, protected)

POST /patients – Create a new patient record

GET /patients – Retrieve all patient records

PUT /patients/{id} – Update an existing patient

DELETE /patients/{id} – Delete a patient by ID

🔑 How to Authenticate

Send a POST request to /token with:

username=admin

password=admin123


2.Install requirements:
pip install -r requirements.txt

3.Run the API:
uvicorn app.main:app --reload

4.Open Swagger UI:
http://127.0.0.1:8000/docs

## 🌐 Deployment

- Render: https://healthrisk-api.onrender.com
- Swagger Docs: https://healthrisk-api.onrender.com/docs

---

## 🧰 Technologies
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT (`python-jose`)
- Swagger/OpenAPI

---

## ✅ Status
Fully functional API with secure authentication and CRUD operations.
Next step: connect with a React-based frontend.


