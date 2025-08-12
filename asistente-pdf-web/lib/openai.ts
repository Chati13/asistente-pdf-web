import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-4o-mini";
export const EMBEDDINGS_MODEL = process.env.EMBEDDINGS_MODEL || "text-embedding-3-large";
