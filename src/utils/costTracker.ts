import { logger } from "./logger";

type ModelPricing = {
  input: number;
  output: number;
};

const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-5-mini": {
    input: 0.15,
    output: 0.60,
  },
  "gpt-5": {
    input: 5.0,
    output: 15.0,
  },
  "gpt-4o-mini": {
    input: 0.15,
    output: 0.075,
  },
  "text-embedding-3-small": {
    input: 0.02,
    output: 0,
  },
};

export function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const pricing = MODEL_PRICING[model];

  if (!pricing) {
    logger.warn({ model }, "Unknown pricing model");
    return 0;
  }

  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;

  return Number((inputCost + outputCost).toFixed(6));
}
