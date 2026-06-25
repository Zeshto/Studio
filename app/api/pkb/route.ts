import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllProducts } from '@/lib/pkb';
import { dbQuery, dbExecute } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const rows = await dbQuery<{ id: string; data: unknown }>(
      'SELECT id, data FROM products ORDER BY id ASC'
    );

    if (rows.length === 0) {
      return NextResponse.json(getAllProducts());
    }

    const products = rows.map(r =>
      typeof r.data === 'string' ? JSON.parse(r.data) : r.data
    );
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(getAllProducts());
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const product = await req.json();
    if (!product.id) return NextResponse.json({ error: 'Product id required.' }, { status: 400 });

    await dbExecute(
      `INSERT INTO products (id, data) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [product.id, JSON.stringify(product)]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update product.' }, { status: 500 });
  }
}
