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

    Please provide a structured plan with a catchy title, a short motivating description, a suitable category, and a list of 3-5 sub-goals (milestones).
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