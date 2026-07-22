from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import GenerateRequest, ScheduleEntryModel
from solver_ortools import ORToolsTimetableSolver
import uvicorn

app = FastAPI(title="Smart AI Timetable Generator API - OR-Tools Engine")

# Allow CORS for local development with Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "engine": "Google OR-Tools CP-SAT v9.15+"}

@app.post("/api/ai/generate", response_model=list[ScheduleEntryModel])
def generate_timetable(request: GenerateRequest):
    result = ORToolsTimetableSolver.solve(request)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
