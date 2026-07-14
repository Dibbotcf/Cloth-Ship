import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureStoriesTable } from '@/lib/stories';

// Public endpoint — only published stories.
export async function GET() {
  try {
    const db = getDb();
    await ensureStoriesTable(db);
    const [rows] = await db.query(
      'SELECT id, title, author, location, rating, content, image, created_at FROM stories WHERE is_published = 1 ORDER BY created_at DESC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}
