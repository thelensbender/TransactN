import fs from "fs/promises";
import { withEveryTransaction, pool } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const folder = path.join(__dirname, "..", "migrations");

// Create schema_migrate table that has a list of files that has been read and their timestamp.
async function createTable(client) {
  await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        file_name VARCHAR(100) NOT NULL,
        ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
}

// Retrieve read file names from the table
async function getRanNames(client) {
  const readFileNames = await client.query(
    `SELECT file_name from schema_migration;`,
  );
  return readFileNames.rows.map((row) => row.file_name);
}

async function migrate() {
  await withEveryTransaction(createTable);
  const ranNames = await withEveryTransaction(getRanNames);

  const allFiles = await fs.readdir(folder);
  const pending = allFiles
    .filter((f) => path.extname(f) === ".sql" && !ranNames.includes(f))
    .sort();

  for (const file of pending) {
    const text = await fs.readFile(path.join(folder, file), "utf8");
    await withEveryTransaction(async (client) => {
      await client.query(text);
      await client.query(
        "INSERT INTO schema_migration (file_name) VALUES ($1)",
        [file],
      );
    });
    console.log("Ran:", file);
  }
  console.log("Done.");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
