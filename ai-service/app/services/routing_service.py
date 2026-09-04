from app.schemas.routing import RoutingRequest, RoutingResponse, RankedFacility

class RoutingService:
    def rank_facilities(self, request: RoutingRequest) -> RoutingResponse:
        ranked = []
        for fac in request.facilities:
            # Hard constraints check
            if request.emergency and not fac.emergency_capable:
                continue
            if request.required_specialty and request.required_specialty not in fac.specialties:
                continue
            if fac.capacity == 'CLOSED':
                continue
                
            # Soft scoring
            score = 100.0
            
            # Distance penalty
            score -= (fac.distance_km * 0.5)
            
            # Wait time penalty
            score -= (fac.wait_time_mins * 0.2)
            
            # Readiness bonus
            score += (fac.readiness_score * 0.3)
            
            # Capacity penalty
            if fac.capacity == 'OVERCAPACITY':
                score -= 30.0
                
            is_alternative = fac.capacity == 'OVERCAPACITY' or score < 50
            
            explanation = f"Selected due to {fac.readiness_score}% readiness score, {fac.distance_km}km away."
            if is_alternative:
                explanation += " Note: Facility is highly loaded or suboptimal."
                
            ranked.append(RankedFacility(
                id=fac.id,
                name=fac.name,
                score=round(score, 2),
                explanation=explanation,
                is_alternative=is_alternative
            ))
            
        # Sort by score descending
        ranked.sort(key=lambda x: x.score, reverse=True)
        
        return RoutingResponse(
            ranked_facilities=ranked,
            constraint_evaluation="Applied specialty and emergency hard constraints. Ranked by proximity, wait time, and capacity load."
        )
