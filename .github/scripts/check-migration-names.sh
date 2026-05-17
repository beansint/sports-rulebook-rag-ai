#!/usr/bin/env bash
set -euo pipefail

shopt -s nullglob
files=(supabase/migrations/*.sql)

if [ ${#files[@]} -eq 0 ]; then
  echo "No migration files found in supabase/migrations"
  exit 0
fi

prev=""
for file in "${files[@]}"; do
  base=$(basename "$file")
  if [[ ! "$base" =~ ^[0-9]{14}_[a-z0-9_]+\.sql$ ]]; then
    echo "Invalid migration filename: $base"
    echo "Expected format: YYYYMMDDHHMMSS_name.sql"
    exit 1
  fi

  if [ ! -s "$file" ]; then
    echo "Migration file is empty: $base"
    exit 1
  fi

  if [ -n "$prev" ] && [[ "$base" < "$prev" ]]; then
    echo "Migrations are not lexicographically sorted: $prev before $base"
    exit 1
  fi

  prev="$base"
done

echo "Migration filenames and ordering look valid"
