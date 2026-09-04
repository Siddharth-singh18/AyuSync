from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SymptomInfo(BaseModel):
    symptom: str
    duration: Optional[str]
    severity: Optional[str]

class VitalInfo(BaseModel):
    temperature: Optional[float]
    blood_pressure: Optional[str]
    heart_rate: Optional[int]

class TriageRequest(BaseModel):
    patientId: str
    age: int
    gender: str
    symptoms: List[SymptomInfo]
    vitals: Optional[VitalInfo]
    history: Optional[str]

class TriageResponse(BaseModel):
    urgency: str # ROUTINE, PRIORITY, URGENT
    confidence: float
    reasons: List[str]
    risk_factors: List[str]
    missing_information: List[str]
    recommended_next_action: str
    escalation_required: bool
    provenance: str
    model_version: str
