import { generateText } from "ai";
import { inngest } from "./client";
// import { anthropic } from "@ai-sdk/anthropic";
import { firecrawl } from "@/lib/firecrawl";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Initialize Google AI
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});
 
const model = google("gemini-2.5-flash");

const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ event, step }) => {
    const { prompt } = event.data as { prompt: string };

    const urls = await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    }) as string[];

    const scrapedContent = await step.run("scrape-urls", async () => {
      if (urls.length === 0) return "";
    
      const results = await Promise.all(
        urls.map(async (url) => {
          const result = await firecrawl.scrapeUrl(url, { 
            formats: ["markdown"] 
          });
    
          // Check if 'success' is true before accessing markdown
          if (result.success) {
            return result.markdown ?? null;
          }
          
          // Log or handle the error quietly
          console.error(`Firecrawl error for ${url}:`, result.error);
          return null;
        })
      );
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scrapedContent
      ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
      : prompt;

    await step.run("generate-text", async () => {
      return await generateText({
        model,
        prompt: finalPrompt, // Now using the prompt with context
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });
    });
  },
);


export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("Inngest error: Background job failed!");
    });
  }
);
