import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { slugify } from '@/lib/utils';
import { isTestDaycare } from '@/lib/utils';
import { getDaycaresForCitySlug, resolveCanonicalCitySlugFromSlug } from '@/lib/metroAreas';
import { projectDaycareListRows } from '@/lib/daycareProjection';

export async function GET(request: Request) {
  const filePath = path.join(process.cwd(), 'data', 'daycares.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContents).filter((d: Record<string, string>) => !isTestDaycare(d));

  const { searchParams } = new URL(request.url);
  const citySlug = resolveCanonicalCitySlugFromSlug(slugify(searchParams.get('city') || ''));
  const countySlug = slugify(searchParams.get('county') || '');

  if (citySlug) {
    const filtered = getDaycaresForCitySlug(data, citySlug);
    return NextResponse.json(projectDaycareListRows(filtered));
  }

  if (countySlug) {
    const filtered = data.filter((d: Record<string, string>) => slugify(d['COUNTY'] || '') === countySlug);
    return NextResponse.json(projectDaycareListRows(filtered));
  }
  
  return NextResponse.json(projectDaycareListRows(data));
}
