// Simple symptom analyzer without external API dependencies
type Severity = "low" | "medium" | "high";

interface HealthAdvice {
  advice: string;
  severity: Severity;
  seekMedicalAttention: boolean;
}

// Basic symptom analysis logic
function analyzeSymptoms(symptoms: string): HealthAdvice {
  const symptomsLower = symptoms.toLowerCase();
  
  // Emergency keywords that indicate high severity
  const emergencyKeywords = [
    'chest pain', 'difficulty breathing', 'unconscious', 
    'severe bleeding', 'stroke', 'heart attack', 'seizure'
  ];
  
  // Moderate concern keywords
  const moderateKeywords = [
    'fever', 'vomiting', 'diarrhea', 'infection',
    'severe pain', 'dizzy', 'migraine'
  ];

  // Check for emergency conditions
  const hasEmergencySymptoms = emergencyKeywords.some(keyword => 
    symptomsLower.includes(keyword)
  );
  
  // Check for moderate symptoms
  const hasModerateSymptoms = moderateKeywords.some(keyword => 
    symptomsLower.includes(keyword)
  );

  if (hasEmergencySymptoms) {
    return {
      severity: "high",
      seekMedicalAttention: true,
      advice: "URGENT: Your symptoms suggest a potentially serious condition. Please seek immediate medical attention or call emergency services. While waiting for help: stay calm, rest, and have someone stay with you if possible."
    };
  }

  if (hasModerateSymptoms) {
    return {
      severity: "medium",
      seekMedicalAttention: true,
      advice: "Your symptoms suggest a condition that should be evaluated by a healthcare provider. Consider scheduling an urgent care visit. Rest, stay hydrated, and monitor your symptoms. If they worsen, seek immediate medical attention."
    };
  }

  return {
    severity: "low",
    seekMedicalAttention: false,
    advice: "Your symptoms appear mild. Rest, stay hydrated, and monitor your condition. If symptoms persist or worsen after 24-48 hours, consult a healthcare provider. Consider over-the-counter medications appropriate for your symptoms."
  };
}

export function getHealthAdvice(symptoms: string): HealthAdvice {
  return analyzeSymptoms(symptoms);
}
