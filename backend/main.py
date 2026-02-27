from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import accidents, vehicles

app = FastAPI(title="Sanjeevani Smart Accident Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(accidents.router, tags=["Accidents"])
app.include_router(vehicles.router, tags=["Vehicles"])

@app.get("/")
async def root():
    return {"message": "Sanjeevani API is running"}

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": "now"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
