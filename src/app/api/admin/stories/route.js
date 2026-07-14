import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureStoriesTable } from '@/lib/stories';

// Admin — all stories (published or not).
export async function GET() {
  try {
    const db = getDb();
    await ensureStoriesTable(db);
    const [rows] = await db.query('SELECT * FROM stories ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const db = getDb();
    await ensureStoriesTable(db);

    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO stories (title, author, location, rating, content, image, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.author || null,
        data.location || null,
        data.rating ? Number(data.rating) : null,
        data.content,
        data.image || null,
        data.is_published === false ? 0 : 1,
      ]
    );

    return NextResponse.json({ id: result.insertId, message: 'Story created' }, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
  }
}
