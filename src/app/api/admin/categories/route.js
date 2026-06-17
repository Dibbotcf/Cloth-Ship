import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

async function ensureTableExists(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`slug\` VARCHAR(255) NOT NULL UNIQUE,
      \`name\` VARCHAR(255) NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function GET(request) {
  try {
    const db = getDb();
    await ensureTableExists(db);
    
    const [rows] = await db.query(`
      SELECT c.*, COUNT(p.id) AS product_count 
      FROM categories c 
      LEFT JOIN products p ON p.category = c.slug 
      GROUP BY c.id 
      ORDER BY c.name ASC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = getDb();
    await ensureTableExists(db);
    
    if (!data.slug || !data.name) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO categories (slug, name) VALUES (?, ?)',
        [data.slug, data.name]
      );
      
      return NextResponse.json({ id: result.insertId, slug: data.slug, name: data.name }, { status: 201 });
    } catch (dbError) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
