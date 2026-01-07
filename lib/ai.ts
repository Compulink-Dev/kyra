// lib/ai.ts
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize Google AI
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

const model = google("gemini-2.5-flash");

export async function generateContent() {
  try {
    const result = await generateText({
      model,
      prompt: "Need to find a logo ai generator",
    });

    return result.text;
  } catch (error) {
    console.error("AI generation error:", error);
    throw error; // Re-throw to handle in API route
  }
}