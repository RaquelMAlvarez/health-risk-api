# app/database.py

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

# URL de la base de datos (archivo local)
DATABASE_URL = "sqlite:///./patients.db"

# Crear el motor y la sesión
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Declarar base
Base = declarative_base()

# Modelo de la tabla patients
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    smoking_history = Column(String)
    pollution_level = Column(String)
    genetic_risk = Column(String)
    risk_level = Column(String)
    recommendation = Column(String)

# Crear las tablas si no existen
def init_db():
    Base.metadata.create_all(bind=engine)
