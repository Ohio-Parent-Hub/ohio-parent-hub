import type { MetadataRoute } from 'next'
import fs from 'node:fs'
import path from 'node:path'

type DaycareRow = Record<string, string>

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), 'data', 'daycares.json')
  if (!fs.existsSync(p)) return []
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw)
}

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ohioparenthub.com'
  const daycares = loadDaycares()
  
  // Get unique cities
  const cities = Array.from(
    new Set(daycares.map(d => d['CITY']).filter(Boolean))
  ).sort()
  
  const urls: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
  
  // City pages
  for (const city of cities) {
    const citySlug = slugify(city)
    urls.push({
      url: `${baseUrl}/daycares/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }
  
  // Daycare detail pages
  for (const daycare of daycares) {
    const programNumber = daycare['PROGRAM NUMBER'] || ''
    const name = daycare['PROGRAM NAME'] || ''
    const city = daycare['CITY'] || ''
    
    if (!programNumber) continue
    
    const slug = `${programNumber}-${slugify(name)}-${slugify(city)}`
    urls.push({
      url: `${baseUrl}/daycare/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }
  
  return urls
}
