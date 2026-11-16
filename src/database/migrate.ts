import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';
import { env } from '../config/env';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

export async function runMigrations(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_schema_migrations_filename (filename)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [appliedRows] = await conn.query('SELECT filename FROM schema_migrations');
    const appliedSet = new Set(
      (appliedRows as Array<{ filename: string }>).map((r) => r.filename)
    );

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('No migrations directory found.');
      return;
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      const statements = sql
        .split(/;\s*(?:\r?\n|$)/)
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      console.log(`[${env.DB_NAME}] Applying migration: ${file}`);
      await conn.beginTransaction();
      try {
        for (const statement of statements) {
          await conn.query(statement);
        }
        await conn.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file]);
        await conn.commit();
        console.log(`[${env.DB_NAME}] Applied: ${file}`);
      } catch (err) {
        await conn.rollback();
        throw err;
      }
    }

    console.log(`[${env.DB_NAME}] All migrations are up to date.`);
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Migration failed:', err);
      await pool.end();
      process.exit(1);
    });
}
