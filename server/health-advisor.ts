// Advanced health monitoring and advice system
type Severity = "low" | "medium" | "high";

interface HealthAdvice {
  advice: string;
  severity: Severity;
  seekMedicalAttention: boolean;
}

interface WaterIntake {
  amount: number; // in ml
  timestamp: Date;
}

interface HealthMetrics {
  sleep: number; // hours
  steps: number;
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  waterIntake: WaterIntake[];
}

const healthTips = [
  "Take breaks every hour when working at a desk to reduce eye strain and improve circulation.",
  "Practice deep breathing exercises to reduce stress and improve focus.",
  "Maintain good posture throughout the day to prevent back pain.",
  "Stay hydrated! Aim to drink water before you feel thirsty.",
  "Get at least 7-8 hours of sleep each night for optimal health.",
  "Take a short walk after meals to aid digestion and maintain blood sugar levels.",
  "Practice mindfulness or meditation to improve mental well-being.",
  "Eat a variety of colorful fruits and vegetables daily.",
  "Stretch regularly to maintain flexibility and prevent muscle tension.",
  "Regular hand washing is one of the best ways to prevent illness."
];

function getDailyWaterTarget(weight: number, activityLevel: 'low' | 'moderate' | 'high'): number {
  // Calculate daily water intake target in ml
  const baseIntake = weight * 30; // 30ml per kg of body weight
  const activityMultiplier = {
    low: 1,
    moderate: 1.2,
    high: 1.4
  };
  return Math.round(baseIntake * activityMultiplier[activityLevel]);
}

function getWaterIntakeAdvice(metrics: HealthMetrics): string {
  const todayIntake = metrics.waterIntake
    .filter(intake => {
      const today = new Date();
      const intakeDate = new Date(intake.timestamp);
      return (
        intakeDate.getDate() === today.getDate() &&
        intakeDate.getMonth() === today.getMonth() &&
        intakeDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((total, intake) => total + intake.amount, 0);

  const target = 2500; // Default target: 2.5L
  const progress = (todayIntake / target) * 100;

  if (progress < 30) {
    return "You're significantly behind on your water intake. Try to drink a glass of water now.";
  } else if (progress < 60) {
    return "You're about halfway to your daily water goal. Keep drinking regularly!";
  } else if (progress < 90) {
    return "Good progress on water intake! A few more glasses to reach your goal.";
  } else {
    return "Excellent! You've met your daily water intake goal.";
  }
}

function getRandomTip(): string {
  return healthTips[Math.floor(Math.random() * healthTips.length)];
}

// Original symptom analysis logic remains the same
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

  for (const condition of moderateConditions) {
    if (condition.keywords.some(keyword => symptomsLower.includes(keyword))) {
      return {
        severity: "medium",
        seekMedicalAttention: true,
        advice: condition.advice + "\n\n" + getRandomTip()
      };
    }
  }

  return {
    severity: "low",
    seekMedicalAttention: false,
    advice: `Based on your symptoms (${symptoms}), your condition appears mild. Rest, stay hydrated, and monitor your symptoms. If they persist or worsen after 24-48 hours, consult a healthcare provider.\n\nHealth Tip: ${getRandomTip()}`
  };
}

export { analyzeSymptoms as getHealthAdvice, getRandomTip, getWaterIntakeAdvice };