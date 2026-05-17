import type { ModelConfig, TokenUsage } from "@/types/rag";

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

export function calculateUsageCost(model: ModelConfig, inputTokens: number, outputTokens: number): TokenUsage {
  const inputCostUsd = (inputTokens / 1_000_000) * asNumber(model.input_rate_per_m);
  const outputCostUsd = (outputTokens / 1_000_000) * asNumber(model.output_rate_per_m);

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    estimatedCostUsd: Number((inputCostUsd + outputCostUsd).toFixed(8)),
  };
}

export function splitUsageCost(model: ModelConfig, inputTokens: number, outputTokens: number) {
  const inputCostUsd = (inputTokens / 1_000_000) * asNumber(model.input_rate_per_m);
  const outputCostUsd = (outputTokens / 1_000_000) * asNumber(model.output_rate_per_m);

  return {
    input_cost_usd: Number(inputCostUsd.toFixed(8)),
    output_cost_usd: Number(outputCostUsd.toFixed(8)),
    total_cost_usd: Number((inputCostUsd + outputCostUsd).toFixed(8)),
  };
}
