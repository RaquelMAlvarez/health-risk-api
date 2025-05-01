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
