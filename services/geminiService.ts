import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

interface Insight {
  insight: string;
}

// Initialize the Google Gemini API client.
// The API key is sourced from the environment variable `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured content (JSON) using the Gemini API.
 * @param prompt The prompt to send to the model.
 * @returns A promise that resolves to an array of insights.
 */
export async function generateContentWithApiKey(prompt: string): Promise<Insight[]> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);
    if (Array.isArray(parsedData)) {
        return parsedData;
    }
    if (parsedData.insights && Array.isArray(parsedData.insights)) {
        return parsedData.insights;
    }

    throw new Error("A resposta da IA não está no formato de insights esperado.");

  } catch (error) {
    console.error("Erro ao chamar a API Gemini (JSON):", error);
    throw new Error("Falha ao gerar insights. Verifique a conexão ou a chave de API.");
  }
}

/**
 * Generates simple text content using the Gemini API.
 * @param prompt The prompt to send to the model.
 * @returns A promise that resolves to a string with the generated text.
 */
export async function generateSimpleText(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    
    return response.text.trim();

  } catch (error) {
    console.error("Erro ao chamar a API Gemini (Texto):", error);
    throw new Error("Falha ao gerar texto. Verifique a conexão ou a chave de API.");
  }
}