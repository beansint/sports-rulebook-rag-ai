import OpenAI from "openai";
import { getRequiredEnv } from "./env";

export function getOpenAIClient() {
  return new OpenAI({ apiKey: getRequiredEnv("OPENAI_API_KEY") });
}
