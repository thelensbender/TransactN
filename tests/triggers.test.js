import { test, expect, beforeEach, afterAll } from "vitest";
import { withEveryTransaction, pool } from "../src/db.js";

// This code runs before each test
beforeEach(async () => {
  await pool.query(
    "TRUNCATE accounts, transactions, entries RESTART IDENTITY CASCADE",
  );
});

afterAll(async () => {
  await pool.end();
});

test("unbalanced transaction is rejected at commit", async () => {
  const run = withEveryTransaction(async (client) => {
    const a = await client.query(
      "INSERT INTO accounts (owner, type, balance) VALUES ('Daniel', 'user', 1000) RETURNING id",
    );
    const b = await client.query(
      "INSERT INTO accounts (owner, type, balance) VALUES ('Bambo', 'user', 0) RETURNING id",
    );
    const t = await client.query(
      "INSERT INTO transactions (kind) VALUES ('transfer') RETURNING id",
    );
    const txId = t.rows[0].id;

    await client.query(
      "INSERT INTO entries (transaction_id, account_id, amount) VALUES ($1, $2, -100)",
      [txId, a.rows[0].id],
    );
    await client.query(
      "INSERT INTO entries (transaction_id, account_id, amount) VALUES ($1, $2, 50)",
      [txId, b.rows[0].id],
    );
  });

  await expect(run).rejects.toThrow("not balanced");
});

async function createBalancedEntry() {
  return withEveryTransaction(async (client) => {
    const a = await client.query(
      "INSERT INTO accounts (owner, type, balance) VALUES ('Daniel', 'user', 1000) RETURNING id",
    );
    const b = await client.query(
      "INSERT INTO accounts (owner, type, balance) VALUES ('Bambo', 'user', 0) RETURNING id",
    );
    const t = await client.query(
      "INSERT INTO transactions (kind) VALUES ('transfer') RETURNING id",
    );
    const e = await client.query(
      "INSERT INTO entries (transaction_id, account_id, amount) VALUES ($1, $2, -100) RETURNING id",
      [t.rows[0].id, a.rows[0].id],
    );
    await client.query(
      "INSERT INTO entries (transaction_id, account_id, amount) VALUES ($1, $2, 100)",
      [t.rows[0].id, b.rows[0].id],
    );
    return e.rows[0].id;
  });
}

test("updating an entry is rejected", async () => {
  const entryId = await createBalancedEntry();
  await expect(
    pool.query("UPDATE entries SET amount = 999 WHERE id = $1", [entryId]),
  ).rejects.toThrow("append-only");
});

test("deleting an entry is rejected", async () => {
  const entryId = await createBalancedEntry();
  await expect(
    pool.query("DELETE FROM entries WHERE id = $1", [entryId]),
  ).rejects.toThrow("append-only");
});