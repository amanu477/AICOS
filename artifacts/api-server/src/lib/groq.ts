import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is required.");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const NOVA_MODEL = "llama-3.3-70b-versatile";
