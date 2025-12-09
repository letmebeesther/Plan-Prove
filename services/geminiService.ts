import { GoogleGenAI, Type } from "@google/genai";

// Ensure API key is present in environment
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface AIPlanRequest {
  goal: string;
  duration: string;
  level: string; // e.g., 'Beginner', 'Advanced'
  style: string; // e.g., 'Steady', 'Intensive'
}

export interface AIPlanResponse {
  title: string;
  description: string;
  category: string;
  subGoals: {
    title: string;
    description: string;
    estimatedDays: number;
  }[];
}

export interface AIMissionRequest {
  challengeTitle: string;
  userInterests: string[]; // e.g. ['Reading', 'Health']
  previousMissions?: string[]; // Avoid duplicates
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

    Please provide a structured plan with a catchy title, a short motivating description, a suitable category (e.g., 건강관리, 어학, 공부루틴, 커리어스킬, 취미, 재정관리), and a list of 3-5 sub-goals (milestones).
    
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
                  estimatedDays: { type: Type.INTEGER }
                },
                required: ["title", "description", "estimatedDays"]
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
        // Fallback for demo without key
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
        1. The mission must be related to the challenge theme.
        2. It should be simple enough to complete in one day.
        3. Avoid these previous missions: ${request.previousMissions?.join(', ') || 'None'}.
        4. Mission length: Max 50 characters (Korean).
        5. Output JSON.
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
                        content: { type: Type.STRING, description: "Mission text in Korean" },
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
        console.error("Error generating mission:", error);
        return {
            content: "오늘 하루 나를 위한 칭찬 한마디 하기",
            type: "REFLECTION",
            difficulty: "EASY"
        };
    }
};
