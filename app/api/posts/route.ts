import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { dbQuery } from '@/lib/db';
import { enrichPost } from '@/lib/enrichPost';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const rows = await dbQuery<{ day_number: number; data: unknown }>(
      'SELECT day_number, data FROM posts ORDER BY day_number ASC'
    );

    const posts = rows.map(r => {
      const data = typeof r.data === 'string' ? JSON.parse(r.data) : r.data;
      const post = { ...data, dayNumber: r.day_number };
      return enrichPost(post);
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load posts.' }, { status: 500 });
  }
}
