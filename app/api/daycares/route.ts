import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function GET(request: Request) {
  const filePath = path.join(process.cwd(), 'data', 'daycares.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents);

  const { searchParams } = new URL(request.url);
  const citySlug = slugify(searchParams.get('city') || '');

  if (citySlug) {
    const filtered = data.filter((d: Record<string, string>) => slugify(d['CITY'] || '') === citySlug);
    return NextResponse.json(filtered);
  }
  
  return NextResponse.json(data);
}
