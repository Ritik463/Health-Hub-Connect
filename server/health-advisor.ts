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

  // Moderate concern keywords with specific advice
  const moderateConditions = [
    {
      keywords: ['fever', 'chills', 'body ache'],
      advice: "You may have a viral infection. Rest, stay hydrated, and take over-the-counter fever reducers if needed. Monitor your temperature and seek medical attention if fever persists over 3 days or exceeds 103°F (39.4°C)."
    },
    {
      keywords: ['headache', 'migraine', 'vision'],
      advice: "For headaches, rest in a quiet, dark room. Try over-the-counter pain relievers. If you experience severe headaches with vision changes or persistent migraines, consult a healthcare provider."
    },
    {
      keywords: ['cough', 'sore throat', 'congestion'],
      advice: "You may have an upper respiratory infection. Get plenty of rest, stay hydrated, use throat lozenges, and consider over-the-counter cold medications. If symptoms worsen or persist beyond a week, see a doctor."
    },
    {
      keywords: ['nausea', 'vomiting', 'diarrhea'],
      advice: "Focus on staying hydrated with small sips of water or electrolyte solutions. Stick to bland foods like bananas, rice, and toast. If symptoms persist beyond 24 hours or you show signs of dehydration, seek medical care."
    },
    {
      keywords: ['rash', 'itching', 'skin'],
      advice: "Avoid scratching and use calamine lotion or hydrocortisone cream. Take an antihistamine if allergies are suspected. If the rash spreads or is accompanied by fever, consult a healthcare provider."
    }
  ];

  // Check for emergency conditions first
  const hasEmergencySymptoms = emergencyKeywords.some(keyword => 
    symptomsLower.includes(keyword)
  );

  if (hasEmergencySymptoms) {
    return {
      severity: "high",
      seekMedicalAttention: true,
      advice: "URGENT: Your symptoms suggest a potentially serious condition. Please seek immediate medical attention or call emergency services. While waiting for help: stay calm, rest, and have someone stay with you if possible."
    };
  }

  // Check for moderate conditions and provide specific advice
  for (const condition of moderateConditions) {
    if (condition.keywords.some(keyword => symptomsLower.includes(keyword))) {
      return {
        severity: "medium",
        seekMedicalAttention: true,
        advice: condition.advice
      };
    }
  }

  // If no specific conditions are matched, provide general advice
  return {
    severity: "low",
    seekMedicalAttention: false,
    advice: `Based on your symptoms (${symptoms}), your condition appears mild. Rest, stay hydrated, and monitor your symptoms. If they persist or worsen after 24-48 hours, consult a healthcare provider. Consider over-the-counter medications appropriate for your specific symptoms.`
  };
}

export function getHealthAdvice(symptoms: string): HealthAdvice {
  return analyzeSymptoms(symptoms);
}