-- Solvane database schema (Postgres / Neon). Run once in the Neon SQL editor.

create table if not exists orders (
  ref         text primary key,
  created_at  timestamptz not null default now(),
  email       text not null,
  status      text not null check (status in ('paid', 'pending_payment', 'cancelled')),
  market      text not null,
  currency    text not null,
  total       numeric(10, 2) not null,
  data        jsonb not null
);
create index if not exists orders_email_idx on orders (email);
create index if not exists orders_created_idx on orders (created_at desc);

-- Discovery Set credits and gift cards can only be used once.
create table if not exists redemptions (
  code        text primary key,
  order_ref   text not null references orders (ref),
  created_at  timestamptz not null default now()
);

create table if not exists subscribers (
  email       text primary key,
  source      text not null default 'site',
  created_at  timestamptz not null default now()
);

create table if not exists messages (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  topic       text not null,
  order_ref   text not null default '',
  body        text not null
);
