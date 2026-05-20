import { describe, it, expect } from "vitest";
import { calculateUsageCost, splitUsageCost } from "@/lib/cost";
import type { ModelConfig } from "@/types/rag";

const model: ModelConfig = {
  id: "test",
  provider: "openai",
  display_name: "Test Model",
  input_rate_per_m: 1.0,
  output_rate_per_m: 2.0,
  enabled: true,
  context_window: 128000,
};

describe("calculateUsageCost", () => {
  it("returns zero cost for zero tokens", () => {
    const result = calculateUsageCost(model, 0, 0);
    expect(result.estimatedCostUsd).toBe(0);
    expect(result.totalTokens).toBe(0);
  });

  it("calculates input cost correctly for 1M tokens", () => {
    const result = calculateUsageCost(model, 1_000_000, 0);
    expect(result.estimatedCostUsd).toBe(1.0);
  });

  it("calculates output cost correctly for 1M tokens", () => {
    const result = calculateUsageCost(model, 0, 1_000_000);
    expect(result.estimatedCostUsd).toBe(2.0);
  });

  it("sums input and output cost", () => {
    const result = calculateUsageCost(model, 1_000_000, 1_000_000);
    expect(result.estimatedCostUsd).toBe(3.0);
  });

  it("coerces string rates to number", () => {
    const m = { ...model, input_rate_per_m: "1" as unknown as number, output_rate_per_m: "2" as unknown as number };
    const result = calculateUsageCost(m, 1_000_000, 0);
    expect(result.estimatedCostUsd).toBe(1.0);
  });
});

describe("splitUsageCost", () => {
  it("returns separate input and output costs", () => {
    const result = splitUsageCost(model, 1_000_000, 1_000_000);
    expect(result.input_cost_usd).toBe(1.0);
    expect(result.output_cost_usd).toBe(2.0);
    expect(result.total_cost_usd).toBe(3.0);
  });

  it("returns zeros for zero tokens", () => {
    const result = splitUsageCost(model, 0, 0);
    expect(result.total_cost_usd).toBe(0);
  });
});
