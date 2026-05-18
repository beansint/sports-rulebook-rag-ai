-- llama-3.3-70b does not exist on Cerebras public endpoints.
-- Replace with gpt-oss-120b (120B params, ~3000 tok/s, production tier).

insert into models (id, provider, display_name, enabled, input_rate_per_m, output_rate_per_m, context_window)
values (
  'gpt-oss-120b',
  'cerebras',
  'GPT OSS 120B (Cerebras)',
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

-- Disable the non-existent model
update models set enabled = false where id = 'llama-3.3-70b';

-- Point default to the correct model
update settings set default_model_id = 'gpt-oss-120b' where id = 'global';
