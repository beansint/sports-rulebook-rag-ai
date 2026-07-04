import OpenAI from "openai";
import type { ModelConfig, RetrievedChunk } from "@/types/rag";
import { calculateUsageCost, splitUsageCost } from "./cost";
import { estimateTokens } from "./text";
import { HttpError } from "./errors";
import { getOpenAIClient } from "./openai";

const ABSTAIN_ANSWER = "I don't know. The retrieved rulebook text does not cover that.";

const PROVIDER_CONFIG: Record<string, { baseURL: string; apiKeyEnv: string } | undefined> = {
  cerebras: { baseURL: "https://api.cerebras.ai/v1", apiKeyEnv: "CEREBRAS_API_KEY" },
};

function getProviderClient(provider: string): OpenAI {
  const cfg = PROVIDER_CONFIG[provider];
  if (!cfg) return getOpenAIClient();
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new HttpError(500, `Missing env var: ${cfg.apiKeyEnv}`);
  return new OpenAI({ apiKey, baseURL: cfg.baseURL });
}

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
    "Do not invent rule or section names; only use ones that appear in the context.",
    // Formatting: return concise, well-structured GitHub-flavored Markdown.
    "Format the answer as clear, concise GitHub-flavored Markdown.",
    "Lead with a one- or two-sentence direct answer, then supporting detail.",
    "Use **bold** for the key ruling and short bullet lists for multiple conditions or steps. Keep paragraphs short.",
    // Inline citations keyed to Source numbers so the UI can link them to cards.
    "Cite every factual claim inline using the source number in square brackets, e.g. [1] or [2][3], matching the 'Source N' blocks in the context.",
    "Place each citation immediately after the sentence or clause it supports. Do not write out 'Source N, page M' as prose and do not add a separate sources list — the [N] markers are enough.",
  ].join(" ");
  const user = `Question: ${question}\n\nOfficial rulebook context:\n${context}`;

  const completion = await getProviderClient(model.provider).chat.completions.create({
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
