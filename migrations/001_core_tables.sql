-- 001 in the file name makes it run first
CREATE TABLE accounts (
  id BIGSERIAL PRIMARY KEY,
  owner TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user', 'system')),
  currency CHAR(3) NOT NULL DEFAULT 'NGN',
  balance BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    type = 'system'
    OR balance >= 0
  )
);

CREATE TABLE transactions (
  id BIGSERIAL PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  request_hash TEXT,
  kind TEXT NOT NULL, -- transfer, deposit, withdrawal, reversal
  status TEXT NOT NULL DEFAULT 'posted',
  reverses_id BIGINT REFERENCES transactions(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE entries (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES transactions(id),
  account_id BIGINT NOT NULL REFERENCES accounts(id),
  amount BIGINT NOT NULL CHECK (amount <> 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX entries_account_idx ON entries (account_id, id);
CREATE INDEX entries_txn_idx ON entries (transaction_id);