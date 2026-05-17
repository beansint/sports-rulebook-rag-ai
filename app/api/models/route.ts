import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse, HttpError } from "@/lib/errors";
import { listModels } from "@/lib/models";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const modelSchema = z.object({
  id: z.string().min(1).max(120),
  provider: z.string().min(1).max(60),
  displayName: z.string().min(1).max(160),
  enabled: z.boolean().default(true),
  inputRatePerM: z.number().nonnegative().default(0),
  outputRatePerM: z.number().nonnegative().default(0),
  contextWindow: z.number().int().positive().nullable().optional(),
});

const updateModelsSchema = z
  .object({
    model: modelSchema.optional(),
    models: z.array(modelSchema).optional(),
    defaultModelId: z.string().min(1).max(120).optional(),
  })
  .refine((value) => value.model || value.models || value.defaultModelId, {
    message: "Provide model, models, or defaultModelId",
  });

export async function GET(request: Request) {
  try {
    requireAdmin(request);
    const supabase = getSupabaseAdmin();
    return NextResponse.json(await listModels(supabase));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireAdmin(request);
    const input = updateModelsSchema.parse(await request.json());
    const supabase = getSupabaseAdmin();
    const models = [...(input.models ?? []), ...(input.model ? [input.model] : [])];

    if (models.length > 0) {
      const { error } = await supabase.from("models").upsert(
        models.map((model) => ({
          id: model.id,
          provider: model.provider,
          display_name: model.displayName,
          enabled: model.enabled,
          input_rate_per_m: model.inputRatePerM,
          output_rate_per_m: model.outputRatePerM,
          context_window: model.contextWindow ?? null,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" },
      );

      if (error) throw new HttpError(500, "Failed to upsert models", error.message);
    }

    if (input.defaultModelId) {
      const { data: model, error: modelError } = await supabase
        .from("models")
        .select("id, enabled")
        .eq("id", input.defaultModelId)
        .maybeSingle<{ id: string; enabled: boolean }>();

      if (modelError) throw new HttpError(500, "Failed to validate default model", modelError.message);
      if (!model || !model.enabled) throw new HttpError(400, "Default model must exist and be enabled");

      const { error: settingsError } = await supabase
        .from("settings")
        .upsert(
          {
            id: "global",
            default_model_id: input.defaultModelId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (settingsError) throw new HttpError(500, "Failed to update default model", settingsError.message);
    }

    return NextResponse.json(await listModels(supabase));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid model update request", details: error.flatten() }, { status: 400 });
    }

    return errorResponse(error);
  }
}
