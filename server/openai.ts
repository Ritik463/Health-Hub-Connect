import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getHealthAdvice(symptoms: string): Promise<{
  advice: string;
  severity: "low" | "medium" | "high";
  seekMedicalAttention: boolean;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful medical AI assistant. Provide general health advice based on symptoms. Always encourage users to seek professional medical help for serious concerns. Format response as JSON with fields: advice (string), severity (low/medium/high), seekMedicalAttention (boolean)."
        },
        {
          role: "user",
          content: `What advice can you give for these symptoms: ${symptoms}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    return JSON.parse(content);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error("Failed to get health advice: " + error.message);
    }
    throw new Error("Failed to get health advice: Unknown error");
  }
}