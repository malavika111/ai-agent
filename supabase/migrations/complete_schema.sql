-- Complete Supabase Schema (Without pgvector)
-- This file contains all the tables and policies used by the current Next.js app backend.

-- 1. Profiles Table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Documents Table
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  url text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Document Chunks Table
-- Modified to use jsonb for embedding since the pgvector extension was removed
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade not null,
  content text not null,
  metadata jsonb,
  embedding jsonb 
);

-- 4. Chat Sessions Table
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Messages Table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions on delete cascade,
  user_id uuid references auth.users on delete cascade,
  role text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Unified Chats Table
-- Sometimes used for streamlined chat history storage without sessions
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  user_message text not null,
  ai_response text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Setup Storage for Documents
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- 8. Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table chat_sessions enable row level security;
alter table messages enable row level security;
alter table chats enable row level security;

-- 9. Basic RLS Policies

-- Profiles RLS
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Documents RLS
create policy "Users can view their own documents." on documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents." on documents for insert with check (auth.uid() = user_id);
create policy "Users can delete their own documents." on documents for delete using (auth.uid() = user_id);

-- Document Chunks RLS
create policy "Users can view their own document chunks" on document_chunks for select using (
  exists (select 1 from documents where documents.id = document_chunks.document_id and documents.user_id = auth.uid())
);
create policy "Users can insert their own document chunks" on document_chunks for insert with check (
  exists (select 1 from documents where documents.id = document_chunks.document_id and documents.user_id = auth.uid())
);
create policy "Users can delete their own document chunks" on document_chunks for delete using (
  exists (select 1 from documents where documents.id = document_chunks.document_id and documents.user_id = auth.uid())
);

-- Chat Sessions RLS
create policy "Users can view own chat sessions" on chat_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own chat sessions" on chat_sessions for insert with check (auth.uid() = user_id);
create policy "Users can delete own chat sessions" on chat_sessions for delete using (auth.uid() = user_id);

-- Messages RLS
create policy "Users can view own messages" on messages for select using (auth.uid() = user_id);
create policy "Users can insert own messages" on messages for insert with check (auth.uid() = user_id);
create policy "Users can delete own messages" on messages for delete using (auth.uid() = user_id);

-- Chats (Unified) RLS
create policy "Users can view own chats" on chats for select using (auth.uid() = user_id);
create policy "Users can insert own chats" on chats for insert with check (auth.uid() = user_id);
create policy "Users can delete own chats" on chats for delete using (auth.uid() = user_id);

-- 10. Storage Rules
-- Using foldername based checking (assuming safe path structure `uuid/file.ext`)
create policy "Authenticated users can upload"
  on storage.objects for insert to authenticated with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own uploaded files"
  on storage.objects for select to authenticated using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own uploaded files"
  on storage.objects for delete to authenticated using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
