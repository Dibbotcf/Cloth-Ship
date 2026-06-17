import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function ensureTableExists(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`occasions\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`slug\` VARCHAR(255) NOT NULL UNIQUE,
      \`name\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [rows] = await db.query('SELECT COUNT(*) as count FROM occasions');
  if (rows[0].count === 0) {
    const defaults = ['Casual', 'Festival', 'Wedding', 'Party', 'Formal'];
    for (const name of defaults) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await db.query('INSERT IGNORE INTO occasions (slug, name) VALUES (?, ?)', [slug, name]);
    }
  }
}

export async function GET() {
  try {
    const db = getDb();
    await ensureTableExists(db);
    
    const [rows] = await db.query('SELECT * FROM occasions ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch occasions' }, { status: 500 });
  }
}
