create policy "auth_update_own_sessions" on chat_sessions
  for update to authenticated using (user_id = auth.uid());
