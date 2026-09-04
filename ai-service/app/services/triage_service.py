from app.schemas.triage import TriageRequest, TriageResponse

class TriageService:
    def __init__(self):
        self.version = "heuristic-rules-v1.0"
        
    def evaluate(self, request: TriageRequest) -> TriageResponse:
        # Base clinical decision-support rules
        urgency = "ROUTINE"
        reasons = []
        risk_factors = []
        missing_info = []
        escalation = False
        
        # Check vital constraints
        if request.vitals:
            if request.vitals.temperature and request.vitals.temperature > 102.0:
                urgency = "URGENT"
                reasons.append("High fever detected (>102.0)")
                escalation = True
            
            if request.vitals.heart_rate and (request.vitals.heart_rate > 120 or request.vitals.heart_rate < 50):
                urgency = "URGENT"
                reasons.append("Abnormal heart rate")
                escalation = True
        else:
            missing_info.append("Vitals not provided")
            
        # Check symptoms
        severe_keywords = ['chest pain', 'breath', 'bleeding', 'unconscious']
        priority_keywords = ['pain', 'vomiting', 'fever']
        
        for sym in request.symptoms:
            s_text = sym.symptom.lower()
            if any(k in s_text for k in severe_keywords) or (sym.severity and sym.severity.upper() == 'HIGH'):
                urgency = "URGENT"
                reasons.append(f"Severe symptom detected: {sym.symptom}")
                escalation = True
            elif any(k in s_text for k in priority_keywords) and urgency != "URGENT":
                urgency = "PRIORITY"
                reasons.append(f"Priority symptom detected: {sym.symptom}")
                
        # Risk factors
        if request.age > 65 or request.age < 2:
            risk_factors.append("Vulnerable age group")
            if urgency == "ROUTINE":
                urgency = "PRIORITY"
                
        if not reasons:
            reasons.append("Standard routine observation")
            
        action = "Immediate specialist consultation required." if escalation else "Standard follow-up and monitoring."
        
        return TriageResponse(
            urgency=urgency,
            confidence=0.85, # Deterministic rules baseline
            reasons=reasons,
            risk_factors=risk_factors,
            missing_information=missing_info,
            recommended_next_action=action,
            escalation_required=escalation,
            provenance="Deterministic Clinical Rule Engine",
            model_version=self.version
        )
