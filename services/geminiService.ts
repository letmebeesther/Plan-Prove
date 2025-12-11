
import { GoogleGenAI, Type } from "@google/genai";

// Ensure API key is present in environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AIPlanRequest {
  goal: string;
  duration: string;
  level: string; 
  style: string; 
  hasWearable?: boolean; 
  executionTime?: string; 
}

export interface AIPlanResponse {
  title: string;
  description: string;
  category: string;
  subGoals: {
    title: string;
    description: string;
    estimatedDays: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    evidenceOptions: {
        type: 'PHOTO' | 'VIDEO' | 'TEXT' | 'APP_CAPTURE' | 'BIOMETRIC' | 'EMAIL' | 'API';
        description: string;
        timeMetadata?: string;
        biometricData?: string;
        locationMetadata?: string;
    }[];
  }[];
}

export interface AIMissionRequest {
  challengeTitle: string;
  userInterests: string[]; 
  previousMissions?: string[]; 
}

export interface AIMissionResponse {
  content: string;
  type: 'ACTION' | 'REFLECTION' | 'CREATIVE' | 'SOCIAL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const generateAIPlan = async (request: AIPlanRequest): Promise<AIPlanResponse | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  const modelId = "gemini-2.5-flash";
  
  const prompt = `
    Create a detailed goal achievement plan based on the following user input:
    - Goal: ${request.goal}
    - Duration: ${request.duration}
    - Difficulty Level: ${request.level}
    - Execution Style: ${request.style}
    - **Preferred Execution Time**: ${request.executionTime ? request.executionTime : 'Flexible'}
    - User has Wearable Device: ${request.hasWearable ? 'YES' : 'NO'}

    **CRITICAL INSTRUCTIONS FOR SUB-GOAL GENERATION:**
    1. **Frequency Analysis**: Analyze the Goal text for frequency keywords (e.g., "Every day", "Daily", "3 times a week").
       - If "Every day" or similar is implied, generate a sub-goal for **EACH day** or logical checkpoints (e.g. Day 1, Day 2... up to 30).
       - If a specific time is mentioned (e.g. "10pm"), enforce it in the 'Time Metadata'.
    
    2. **Execution Time Enforcement**: If 'Preferred Execution Time' is provided (e.g., "07:00"), every generated sub-goal MUST explicitly mention this time in its description or metadata (e.g., "Run at 07:00").

    3. **Sub-Goal Count**: You may generate up to **30 sub-goals** if the plan is a daily routine (e.g. "30-Day Challenge"). Otherwise, default to 3-10 milestones.

    Please provide a structured plan with a catchy title, a short motivating description, a suitable category, and the list of sub-goals.
    
    For each sub-goal, include:
    1. A recommended difficulty level (EASY, MEDIUM, HARD).
    2. **Evidence Options**: Provide 3 distinct ways the user can prove they completed this goal. Each option should have:
       - Type: PHOTO, VIDEO, TEXT, APP_CAPTURE, BIOMETRIC, EMAIL, API.
       - Description: Specific instruction.
       - Time Metadata: Recommended time logic (e.g. "${request.executionTime || 'Anytime'}").
       - Biometric Data: ${request.hasWearable ? 'Include specific target health data (e.g. "Heart Rate > 120") if relevant.' : 'Leave empty.'}
       - Location Metadata: Include a recommended location if applicable.
    
    IMPORTANT: The output MUST be in Korean language.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            subGoals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedDays: { type: Type.INTEGER },
                  difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD'] },
                  evidenceOptions: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              type: { type: Type.STRING, enum: ['PHOTO', 'VIDEO', 'TEXT', 'APP_CAPTURE', 'BIOMETRIC', 'EMAIL', 'API'] },
                              description: { type: Type.STRING },
                              timeMetadata: { type: Type.STRING },
                              biometricData: { type: Type.STRING },
                              locationMetadata: { type: Type.STRING }
                          },
                          required: ["type", "description"]
                      }
                  }
                },
                required: ["title", "description", "estimatedDays", "difficulty", "evidenceOptions"]
              }
            }
          },
          required: ["title", "description", "category", "subGoals"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIPlanResponse;
    }
    return null;
  } catch (error) {
    console.error("Error generating plan with Gemini:", error);
    throw error;
  }
};

export const generateRandomMission = async (request: AIMissionRequest): Promise<AIMissionResponse | null> => {
    if (!apiKey) {
        return {
            content: "좋아하는 책의 한 구절을 필사해보세요.",
            type: "REFLECTION",
            difficulty: "EASY"
        };
    }

    const modelId = "gemini-2.5-flash";
    const prompt = `
        Generate a daily random mission for a user participating in the challenge: "${request.challengeTitle}".
        User Interests: ${request.userInterests.join(', ')}.
        Rules:
        1. Related to challenge theme.
        2. Simple enough for one day.
        3. Avoid previous missions: ${request.previousMissions?.join(', ') || 'None'}.
        4. Max 50 chars (Korean).
        Output JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        content: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['ACTION', 'REFLECTION', 'CREATIVE', 'SOCIAL'] },
                        difficulty: { type: Type.STRING, enum: ['EASY', 'MEDIUM', 'HARD'] }
                    },
                    required: ["content", "type", "difficulty"]
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as AIMissionResponse;
        }
        return null;
    } catch (error) {
        return null;
    }
};

export const generateAIEvidenceSuggestions = async (
  title: string, 
  description: string, 
  hasWearable: boolean
) => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [];
  }

  const modelId = "gemini-2.5-flash";
  const prompt = `
    Suggest 3 distinct verification methods (evidence options) for the following sub-goal:
    - Goal: ${title}
    - Description: ${description}
    - User has Wearable Device: ${hasWearable ? 'YES' : 'NO'}

    For each option, provide:
    1. Type: Choose one from [PHOTO, VIDEO, TEXT, APP_CAPTURE, BIOMETRIC, EMAIL, API].
       - Use 'BIOMETRIC' only if user has wearable and it involves health data.
       - Use 'EMAIL' for official acceptances.
       - Use 'API' for official scores.
    2. Description: Specific instruction.
    3. Metadata:
       - timeMetadata: recommended time.
       - biometricData: target values if BIOMETRIC.
       - locationMetadata: target place if relevant.

    Output JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['PHOTO', 'VIDEO', 'TEXT', 'APP_CAPTURE', 'BIOMETRIC', 'EMAIL', 'API'] },
              description: { type: Type.STRING },
              timeMetadata: { type: Type.STRING },
              biometricData: { type: Type.STRING },
              locationMetadata: { type: Type.STRING }
            },
            required: ["type", "description"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Error generating evidence suggestions:", error);
    return [];
  }
};
