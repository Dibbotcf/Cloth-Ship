import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ensureStoriesTable } from '@/lib/stories';

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    await ensureStoriesTable(db);
    const [rows] = await db.query('SELECT * FROM stories WHERE id = ?', [id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch story' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const db = getDb();
    await ensureStoriesTable(db);

    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await db.query(
      `UPDATE stories SET title=?, author=?, location=?, rating=?, content=?, image=?, is_published=? WHERE id=?`,
      [
        data.title,
        data.author || null,
        data.location || null,
        data.rating ? Number(data.rating) : null,
        data.content,
        data.image || null,
        data.is_published === false ? 0 : 1,
        id,
      ]
    );

    return NextResponse.json({ message: 'Story updated' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const db = getDb();
    await db.query('DELETE FROM stories WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Story deleted' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
