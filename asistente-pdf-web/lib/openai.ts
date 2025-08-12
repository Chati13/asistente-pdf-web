import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// Modelos por defecto (coinciden con lo que pusimos en Vercel y en Supabase)
export const CHAT_MODEL = process.env.CHAT_MODEL || "gpt-5";
export const EMBEDDINGS_MODEL = process.env.EMBEDDINGS_MODEL || "text-embedding-3-small";
