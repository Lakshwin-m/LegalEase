import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import db from './db';

export function seedDatabase() {
  // 1. Create tables
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS ipc_fts USING fts5(
      section,
      offense,
      punishment,
      description,
      content='ipc_sections'
    );

    CREATE TABLE IF NOT EXISTS ipc_sections (
      id INTEGER PRIMARY KEY,
      section TEXT,
      offense TEXT,
      punishment TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES sessions(id),
      role TEXT CHECK(role IN ('user', 'assistant')),
      content TEXT,
      sources TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if we already have data
  const count = db.prepare('SELECT COUNT(*) as c FROM ipc_sections').get() as { c: number };
  if (count.c > 0) {
    console.log('Database already seeded.');
    return;
  }

  // 2. Read and parse CSV
  const csvPath = process.env.IPC_CSV_PATH || './data/ipc.csv';
  const fullCsvPath = path.resolve(process.cwd(), csvPath);
  
  if (!fs.existsSync(fullCsvPath)) {
    console.warn(`CSV file not found at ${fullCsvPath}. Skipping seed.`);
    return;
  }
  
  const fileContent = fs.readFileSync(fullCsvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // 3. Insert records
  const insertSection = db.prepare(`
    INSERT INTO ipc_sections (section, offense, punishment, description)
    VALUES (@section, @offense, @punishment, @description)
  `);

  const insertFts = db.prepare(`
    INSERT INTO ipc_fts (rowid, section, offense, punishment, description)
    VALUES (last_insert_rowid(), @section, @offense, @punishment, @description)
  `);

  const insertTransaction = db.transaction((rows: any[]) => {
    for (const row of rows) {
      if (!row.Section || row.Section.trim() === '') continue;

      const data = {
        section: row.Section,
        offense: row.Offense || '',
        punishment: row.Punishment || '',
        description: row.Description || ''
      };

      insertSection.run(data);
      insertFts.run(data);
    }
  });

  insertTransaction(records);
  console.log(`Seeded ${records.length} IPC sections.`);
}
