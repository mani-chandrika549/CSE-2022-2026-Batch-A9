import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getTravelInsights(destination: string, category: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide travel insights for ${destination} (Category: ${category}). 
      Include:
      1. Recommended travel duration (e.g., 3-4 days)
      2. Best activities (list 3-4)
      3. Travel tips (2-3 practical tips)
      Format the output as JSON with keys: duration, activities (array), tips (array).`,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      duration: "3-5 days",
      activities: ["Local sightseeing", "Cultural tours", "Photography"],
      tips: ["Carry comfortable walking shoes", "Check local weather before heading out"]
    };
  }
}

export async function getItinerary(destination: string, days: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a day-by-day travel itinerary for ${destination} for a duration of ${days}. 
      Format the output as JSON with an array of objects, each having 'day' (number) and 'plan' (string description).`,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Itinerary Error:", error);
    return [
      { day: 1, plan: "Arrival and local exploration." },
      { day: 2, plan: "Visit major landmarks and city center." },
      { day: 3, plan: "Shopping and departure." }
    ];
  }
}
