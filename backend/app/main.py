"""
Eclipse Reconciler Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .api.routes_cases import router as cases_router
from .api.routes_approvals import router as approvals_router
from .api.routes_audit import router as audit_router

app = FastAPI(
    title="Eclipse Reconciler API",
    description="Autonomous Resolution of Cross-System Transaction Mismatches",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases_router)
app.include_router(approvals_router)
app.include_router(audit_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "mock_llm_mode": settings.MOCK_LLM_MODE,
        "auto_threshold_inr": settings.AUTO_APPROVAL_THRESHOLD_INR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
