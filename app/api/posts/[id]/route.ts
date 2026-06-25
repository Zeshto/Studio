import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { dbQuery, dbExecute } from '@/lib/db';
import { generatePost } from '@/lib/contentEngine';
import { enrichPost } from '@/lib/enrichPost';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { id } = await params;
  const dayNumber = parseInt(id, 10);
  if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 150) {
    return NextResponse.json({ error: 'Invalid day number.' }, { status: 400 });
  }

  try {
    const rows = await dbQuery<{ data: unknown }>(
      'SELECT data FROM posts WHERE day_number = $1',
      [dayNumber]
    );

    if (rows.length === 0) {
      const post = generatePost(dayNumber);
      return NextResponse.json(enrichPost(post));
    }

    const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
    return NextResponse.json(enrichPost(data));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load post.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { id } = await params;
  const dayNumber = parseInt(id, 10);
  if (isNaN(dayNumber)) return NextResponse.json({ error: 'Invalid day.' }, { status: 400 });

  try {
    const body = await req.json();
    const updated = { ...body, isEdited: true, updatedAt: new Date().toISOString() };

    await dbExecute(
      `INSERT INTO posts (id, day_number, data) VALUES ($1, $2, $3)
       ON CONFLICT (day_number) DO UPDATE SET data = $3, updated_at = NOW()`,
      [`post-day-${dayNumber}`, dayNumber, JSON.stringify(updated)]
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save post.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Regenerate endpoint
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { id } = await params;
  const dayNumber = parseInt(id, 10);
  if (isNaN(dayNumber)) return NextResponse.json({ error: 'Invalid day.' }, { status: 400 });

  try {
    const variation = generatePost(dayNumber + 150);
    const regenerated = enrichPost({
      ...variation,
      dayNumber,
      id: `post-day-${dayNumber}`,
      isEdited: true,
      updatedAt: new Date().toISOString(),
    });

    await dbExecute(
      `INSERT INTO posts (id, day_number, data) VALUES ($1, $2, $3)
       ON CONFLICT (day_number) DO UPDATE SET data = $3, updated_at = NOW()`,
      [`post-day-${dayNumber}`, dayNumber, JSON.stringify(regenerated)]
    );

    return NextResponse.json(regenerated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to regenerate post.' }, { status: 500 });
  }
}
