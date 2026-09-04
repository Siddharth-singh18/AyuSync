from pydantic import BaseModel
from typing import List, Optional

class FacilityInfo(BaseModel):
    id: str
    name: str
    specialties: List[str]
    capacity: str # OPEN, CLOSED, OVERCAPACITY
    emergency_capable: bool
    distance_km: float
    wait_time_mins: int
    readiness_score: float

class RoutingRequest(BaseModel):
    required_specialty: Optional[str]
    emergency: bool
    facilities: List[FacilityInfo]

class RankedFacility(BaseModel):
    id: str
    name: str
    score: float
    explanation: str
    is_alternative: bool

class RoutingResponse(BaseModel):
    ranked_facilities: List[RankedFacility]
    constraint_evaluation: str
