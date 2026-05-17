import { HttpError } from "./errors";

export function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new HttpError(500, `Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string, fallback: string) {
  return process.env[name] || fallback;
}

export function getEmbeddingModel() {
  return getOptionalEnv("EMBEDDING_MODEL", "text-embedding-3-small");
}

export function getDefaultChatModel() {
  return getOptionalEnv("DEFAULT_CHAT_MODEL", "gpt-4.1-mini");
}
