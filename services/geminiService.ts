
import { GoogleGenAI, Type } from "@google/genai";
import { DiaperConsumptionEstimate } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is present.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getDiaperRecommendation = async (ageInMonths: number): Promise<DiaperConsumptionEstimate> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on general pediatric guidelines, what is the typical daily, weekly, and monthly diaper consumption for a baby that is ${ageInMonths} months old?`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            daily: {
              type: Type.INTEGER,
              description: 'Average number of diapers per day.'
            },
            weekly: {
              type: Type.INTEGER,
              description: 'Average number of diapers per week.'
            },
            monthly: {
              type: Type.INTEGER,
              description: 'Average number of diapers per month.'
            },
          },
          required: ["daily", "weekly", "monthly"],
        },
      },
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);
    return data as DiaperConsumptionEstimate;
  } catch (error) {
    console.error("Error fetching diaper recommendation from Gemini API:", error);
    throw new Error("Failed to get recommendation. Please check your API key and try again.");
  }
};
