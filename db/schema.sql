-- Company Brain schema. Idempotent: safe to re-run.

create table if not exists users (
  id        serial primary key,
  name      text not null,
  role      text not null,
  expertise text[] not null default '{}'
);

create table if not exists knowledge_entries (
  id               serial primary key,
  question         text not null,
  answer           text not null,
  sources          text[] not null default '{}',
  author_id        int not null references users(id),
  weight           int not null default 1,
  overrides_doc_id text,
  created_at       timestamptz not null default now()
);

-- payer is in the table definition from the start.
-- Part 3 step 5 needs it and adding it later breaks the Gaps tab.
create table if not exists gap_log (
  id         serial primary key,
  question   text not null,
  asked_by   int not null references users(id),
  confidence text not null,
  payer      text,
  created_at timestamptz not null default now()
);

create index if not exists knowledge_entries_question_idx
  on knowledge_entries (lower(trim(question)));
create index if not exists gap_log_payer_idx on gap_log (payer);
