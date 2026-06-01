-- Telegram account linking: one row per Supabase user that connects a Telegram chat_id.
create table if not exists public.telegram_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chat_id bigint,
  link_code varchar(8),
  code_expires_at timestamptz,
  linked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id)
);

create unique index if not exists telegram_links_chat_id_idx
  on public.telegram_links(chat_id)
  where chat_id is not null;

create unique index if not exists telegram_links_link_code_idx
  on public.telegram_links(link_code)
  where link_code is not null;

alter table public.telegram_links enable row level security;

create policy "telegram_links_select_own"
  on public.telegram_links
  for select
  using (auth.uid() = user_id);

create policy "telegram_links_insert_own"
  on public.telegram_links
  for insert
  with check (auth.uid() = user_id);

create policy "telegram_links_update_own"
  on public.telegram_links
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "telegram_links_delete_own"
  on public.telegram_links
  for delete
  using (auth.uid() = user_id);
