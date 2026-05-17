import type { ModelConfig, RetrievedChunk } from "@/types/rag";
import { calculateUsageCost, splitUsageCost } from "./cost";
import { estimateTokens } from "./text";
import { HttpError } from "./errors";
import { getOpenAIClient } from "./openai";

const ABSTAIN_ANSWER = "I don't know. The retrieved rulebook text does not cover that.";

export function buildContext(chunks: RetrievedChunk[]) {
  return chunks
    .map((chunk, index) => {
      return [
        `Source ${index + 1}`,
        `Document: ${chunk.title}`,
        `Season: ${chunk.season}`,
        `Page: ${chunk.page_number}`,
        `Text: ${chunk.content}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}

export async function generateAnswer(question: string, chunks: RetrievedChunk[], model: ModelConfig) {
  if (model.provider !== "openai") {
    throw new HttpError(501, `Provider is not implemented in the backend MVP: ${model.provider}`);
  }

  if (chunks.length === 0) {
    return {
      answer: ABSTAIN_ANSWER,
      usage: calculateUsageCost(model, 0, estimateTokens(ABSTAIN_ANSWER)),
      costFields: splitUsageCost(model, 0, estimateTokens(ABSTAIN_ANSWER)),
    };
  }

  const context = buildContext(chunks);
  const system = [
    "You answer sports rulebook questions strictly from the provided official rulebook context.",
    "Do not use outside knowledge.",
    "If the context does not answer the question, say: I don't know. The retrieved rulebook text does not cover that.",
    "Cite page numbers in the answer when useful, but do not invent section names.",
  ].join(" ");
  const user = `Question: ${question}\n\nOfficial rulebook context:\n${context}`;

  const completion = await getOpenAIClient().chat.completions.create({
    model: model.id,
    temperature: 0.1,
    max_tokens: 700,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const answer = completion.choices[0]?.message?.content?.trim() || ABSTAIN_ANSWER;
  const inputTokens = completion.usage?.prompt_tokens ?? estimateTokens(system + user);
  const outputTokens = completion.usage?.completion_tokens ?? estimateTokens(answer);

  return {
    answer,
    usage: calculateUsageCost(model, inputTokens, outputTokens),
    costFields: splitUsageCost(model, inputTokens, outputTokens),
  };
}
