import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelConfig } from "@/types/rag";
import { getDefaultChatModel } from "./env";
import { HttpError } from "./errors";

type SettingsRow = {
  default_model_id: string;
};

export async function getDefaultModelId(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("settings")
    .select("default_model_id")
    .eq("id", "global")
    .maybeSingle<SettingsRow>();

  if (error) throw new HttpError(500, "Failed to load default model", error.message);
  return data?.default_model_id || getDefaultChatModel();
}

export async function getEnabledModel(supabase: SupabaseClient, modelId: string) {
  const { data, error } = await supabase
    .from("models")
    .select("id, provider, display_name, enabled, input_rate_per_m, output_rate_per_m, context_window")
    .eq("id", modelId)
    .eq("enabled", true)
    .maybeSingle<ModelConfig>();

  if (error) throw new HttpError(500, "Failed to load model", error.message);
  if (!data) throw new HttpError(400, `Model is not enabled or does not exist: ${modelId}`);
  return data;
}

export async function selectModel(supabase: SupabaseClient, requestedModelId: string | undefined, isAdmin: boolean) {
  // All authenticated users can pick any enabled model; admins can also request disabled ones
  if (isAdmin && requestedModelId) {
    const { data, error } = await supabase
      .from("models")
      .select("id, provider, display_name, enabled, input_rate_per_m, output_rate_per_m, context_window")
      .eq("id", requestedModelId)
      .maybeSingle<ModelConfig>();
    if (error) throw new HttpError(500, "Failed to load model", error.message);
    if (!data) throw new HttpError(400, `Model does not exist: ${requestedModelId}`);
    return data;
  }
  const modelId = requestedModelId ?? await getDefaultModelId(supabase);
  return getEnabledModel(supabase, modelId);
}

export async function listEnabledModels(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("models")
    .select("id, display_name, provider")
    .eq("enabled", true)
    .order("display_name", { ascending: true });

  if (error) throw new HttpError(500, "Failed to list models", error.message);
  return data ?? [];
}

export async function listModels(supabase: SupabaseClient) {
  const [{ data: models, error: modelError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase
      .from("models")
      .select("id, provider, display_name, enabled, input_rate_per_m, output_rate_per_m, context_window, metadata, created_at, updated_at")
      .order("provider", { ascending: true })
      .order("id", { ascending: true }),
    supabase.from("settings").select("default_model_id").eq("id", "global").maybeSingle<SettingsRow>(),
  ]);

  if (modelError) throw new HttpError(500, "Failed to list models", modelError.message);
  if (settingsError) throw new HttpError(500, "Failed to load settings", settingsError.message);

  return {
    models: models ?? [],
    defaultModelId: settings?.default_model_id ?? getDefaultChatModel(),
  };
}
