from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# Cargar modelo
modelo = joblib.load("modelo_adiccion.pkl")

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):

    return templates.TemplateResponse(
    request=request,
    name="index.html"
)

# Modelo de entrada
class DatosJugador(BaseModel):
    daily_gaming_hours: float
    withdrawal_symptoms: int
    loss_of_other_interests: int
    continued_despite_problems: int
    sleep_quality: int
    social_isolation_score: float

@app.post("/predecir")

def predecir(datos: DatosJugador):

    df = pd.DataFrame([{
        "daily_gaming_hours": datos.daily_gaming_hours,
        "withdrawal_symptoms": datos.withdrawal_symptoms,
        "loss_of_other_interests": datos.loss_of_other_interests,
        "continued_despite_problems": datos.continued_despite_problems,
        "sleep_quality": datos.sleep_quality,
        "social_isolation_score": datos.social_isolation_score
    }])

    prediccion = float(modelo.predict(df)[0])

    prediccion = max(0, min(3, prediccion))

    if prediccion <= 0.5:
        nivel = "LOW"
    elif prediccion <= 1.5:
        nivel = "MODERATE"
    elif prediccion <= 2.5:
        nivel = "HIGH"
    else:
        nivel = "SEVERE"

    return {
    "score": float(prediccion),
    "risk_level": nivel
    }