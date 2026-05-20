-- Add Cerebras Llama 3.3 70B as the default free-tier LLM.
-- Cerebras free plan: 1M tokens/day, no credit card required.
-- API is OpenAI-compatible; baseURL handled in lib/generation.ts.

insert into models (id, provider, display_name, enabled, input_rate_per_m, output_rate_per_m, context_window)
values (
  'llama-3.3-70b',
  'cerebras',
  'Llama 3.3 70B (Cerebras)',
  true,
  0.00,
  0.00,
  8192
)
on conflict (id) do update
  set provider           = excluded.provider,
      display_name       = excluded.display_name,
      enabled            = excluded.enabled,
      input_rate_per_m   = excluded.input_rate_per_m,
      output_rate_per_m  = excluded.output_rate_per_m,
      context_window     = excluded.context_window,
      updated_at         = now();

-- Set as the default model
insert into settings (id, default_model_id)
values ('global', 'llama-3.3-70b')
on conflict (id) do update
  set default_model_id = excluded.default_model_id;
