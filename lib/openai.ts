import OpenAI from "openai";
import { getRequiredEnv, getOptionalEnv } from "./env";

export function getOpenAIClient() {
  return new OpenAI({ apiKey: getRequiredEnv("OPENAI_API_KEY") });
}

export function getEmbeddingClient() {
  return new OpenAI({
    apiKey: getRequiredEnv("EMBEDDING_API_KEY"),
    baseURL: getOptionalEnv("EMBEDDING_BASE_URL", "https://api.mistral.ai/v1"),
  });
}
