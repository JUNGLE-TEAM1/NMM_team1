from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="AskLake API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def health_payload() -> dict[str, str]:
    return {
        "service": "asklake-backend",
        "status": "ok",
        "app": "AskLake",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return health_payload()


@app.get("/api/health")
def api_health() -> dict[str, str]:
    return health_payload()
