import pg from "pg";
import config from "./config.js";

const { Pool, types } = pg;

// Converts massive numbers sent as strings to number.
types.setTypeParser(20, (value) => {
  return Number(value);
});

export const pool = new Pool({ connectionString: config.databaseUrl });

export async function withEveryTransaction(func) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await func(client);
    await client.query("COMMIT");
    return res;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
