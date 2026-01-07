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

// export const demoGenerate = inngest.createFunction(
//   { id: "demo-generate" },
//   { event: "demo/generate" },
//   async ({ event, step }) => {
//     const { prompt } = event.data as { prompt: string; };

//     const urls = await step.run("exctract-urls", async () => {
//       return prompt.match(URL_REGEX) ?? [];
//     }) as string[];

//     const scrapedContent = await step.run("scrape-urls", async () => {
//       const results = await Promise.all(
//         urls.map(async (url) => {
//           const result = await firecrawl.scrape(
//             url,
//             { formats: ["markdown"] },
//           );
//           return result.markdown ?? null;
//         })
//       );
//       return results.filter(Boolean).join("\n\n");
//     });

//     const finalPrompt = scrapedContent
//       ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}`
//       : prompt;

//     await step.run("generate-text", async () => {
//       return await generateText({
//       model,
//         prompt: prompt,
//         experimental_telemetry: {
//           isEnabled: true,
//           recordInputs: true,
//           recordOutputs: true,
//         },
//       });
//     })
//   },
// );

export const demoGenerate = inngest.createFunction(
  {id: 'demo-genrate'},
  {event: "demo/generate"},
  async ({ step}) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: google('gemini-2.5-flash'),
        prompt: "How to start my year 2026"
      })
    })
  }
)

export const demoError = inngest.createFunction(
  { id: "demo-error" },
  { event: "demo/error" },
  async ({ step }) => {
    await step.run("fail", async () => {
      throw new Error("Inngest error: Background job failed!");
    });
  }
);
