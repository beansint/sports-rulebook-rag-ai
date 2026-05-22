import { getEmbeddingModel } from "./env";
import { getEmbeddingClient } from "./openai";

export type EmbeddingBatchResult = {
  embeddings: number[][];
  totalTokens: number;
};

const EMBEDDING_BATCH_SIZE = 64;

export async function embedTexts(texts: string[]): Promise<EmbeddingBatchResult> {
  const openai = getEmbeddingClient();
  const model = getEmbeddingModel();
  const embeddings: number[][] = [];
  let totalTokens = 0;

  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const response = await openai.embeddings.create({
      model,
      input: batch,
      encoding_format: "float",
    });

    const sorted = [...response.data].sort((a, b) => a.index - b.index);
    embeddings.push(...sorted.map((item) => item.embedding));
    totalTokens += response.usage?.total_tokens ?? 0;
  }

  return { embeddings, totalTokens };
}

export async function embedText(text: string) {
  const result = await embedTexts([text]);
  return { embedding: result.embeddings[0], tokens: result.totalTokens };
}
