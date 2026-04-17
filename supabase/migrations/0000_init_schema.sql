-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  url text not null,
  type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create document_chunks table (stores text chunks and pgvector embeddings)
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents on delete cascade not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536) -- OpenAI embedding standard size, change to 1024 or 768 if using other models
);

-- Create chat_sessions table
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create chat_messages table
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RPC for similarity search (used for RAG pipeline)
create or replace function match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  -- Optionally join with documents filtering by user_id if needed:
  -- join documents on document_chunks.document_id = documents.id
  -- where (p_user_id is null or documents.user_id = p_user_id) and 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- Setup Storage for Documents
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled for tables
alter table profiles enable row level security;
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- Basic RLS Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Documents RLS
create policy "Users can view their own documents."
  on documents for select using (auth.uid() = user_id);
create policy "Users can insert their own documents."
  on documents for insert with check (auth.uid() = user_id);
create policy "Users can delete their own documents."
  on documents for delete using (auth.uid() = user_id);

-- Document Chunks RLS (Admin can view all, users implicitly view their own via documents table, but here we simplify)
create policy "Users can view relevant document chunks"
  on document_chunks for select using (
    exists (select 1 from documents where documents.id = document_chunks.document_id and documents.user_id = auth.uid())
  );
create policy "Service role can orchestrate chunks"
  on document_chunks for all using (true); -- Usually API route uses service role to insert chunks

-- Chat Sessions RLS
create policy "Users can view own chat sessions"
  on chat_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own chat sessions"
  on chat_sessions for insert with check (auth.uid() = user_id);
create policy "Users can delete own chat sessions"
  on chat_sessions for delete using (auth.uid() = user_id);

-- Chat Messages RLS
create policy "Users can view own messages"
  on chat_messages for select using (
    exists (select 1 from chat_sessions where chat_sessions.id = chat_messages.session_id and chat_sessions.user_id = auth.uid())
  );
create policy "Users can insert own messages"
  on chat_messages for insert with check (
    exists (select 1 from chat_sessions where chat_sessions.id = chat_messages.session_id and chat_sessions.user_id = auth.uid())
  );

-- Storage RLS (example placeholder, replace with secure policies needed for storage)
create policy "Authenticated users can upload"
  on storage.objects for insert to authenticated with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read own uploaded files"
  on storage.objects for select to authenticated using (bucket_id = 'documents' and auth.uid() = owner);
