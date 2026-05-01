import { GoogleGenAI, Type } from "@google/genai";
import { VolunteerOpportunity } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function searchVolunteerOpportunities(
  location: string,
  category?: string,
  query?: string
): Promise<VolunteerOpportunity[]> {
  const prompt = `Find current and real volunteer opportunities in or near ${location}. 
    ${category ? `Focus on the ${category} category.` : ""}
    ${query ? `Specific interests: ${query}` : ""}
    Return a list of at least 5 opportunities with details: title, organization, location (be specific about city/neighborhood), a brief inviting description, tags, and a link to apply or learn more.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              organization: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              link: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["title", "organization", "location", "description", "link"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Ensure IDs are present and unique
    const results: VolunteerOpportunity[] = JSON.parse(text).map((opp: any, index: number) => ({
      ...opp,
      id: opp.id || `opp-${Date.now()}-${index}`,
      category: opp.category || category || 'General'
    }));

    return results;
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return [];
  }
}
