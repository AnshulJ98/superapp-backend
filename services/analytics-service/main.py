# Minimal FastAPI analytics service
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class AnalyticsData(BaseModel):
    id: int
    value: float

@app.get("/")
def root():
    return {"message": "Analytics Service Running"}

@app.get("/analytics", response_model=List[AnalyticsData])
def get_analytics():
    return [AnalyticsData(id=1, value=42.0)]
