import type { MetadataRoute } from 'next'
import fs from 'node:fs'
import path from 'node:path'
import { slugify } from '@/lib/utils'
import { isTestDaycare } from '@/lib/utils'
import { getMetroCitySlugs, resolveCanonicalCitySlugFromName } from '@/lib/metroAreas'

type DaycareRow = Record<string, string>

function loadDaycares(): DaycareRow[] {
  const p = path.join(process.cwd(), 'data', 'daycares.json')
  if (!fs.existsSync(p)) return []
  const raw = fs.readFileSync(p, 'utf8')
  return JSON.parse(raw)
}

function getStableLastModified() {
  const fromEnv = process.env.SITEMAP_LASTMOD
  if (fromEnv) {
    const parsed = new Date(fromEnv)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }

  const dataPath = path.join(process.cwd(), 'data', 'daycares.json')
  if (fs.existsSync(dataPath)) {
    return fs.statSync(dataPath).mtime
  }

  return new Date('2026-01-01T00:00:00.000Z')
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ohioparenthub.com'
  const daycares = loadDaycares().filter(d => !isTestDaycare(d));
  const lastModified = getStableLastModified()
  
  const citySlugSet = new Set(
    daycares
      .map(d => resolveCanonicalCitySlugFromName(d['CITY'] || ''))
      .filter(Boolean)
  )
  getMetroCitySlugs(daycares).forEach((metroSlug) => citySlugSet.add(metroSlug))
  const citySlugs = Array.from(citySlugSet).sort()

  const countySlugSet = new Set(
    daycares
      .map(d => slugify(d['COUNTY'] || ''))
      .filter(Boolean)
  )
  const countySlugs = Array.from(countySlugSet).sort()
  
  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/for-providers`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/daycares`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cities`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/counties`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  for (const countySlug of countySlugs) {
    urls.push({
      url: `${baseUrl}/daycares/county/${countySlug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }
  
  for (const citySlug of citySlugs) {
    urls.push({
      url: `${baseUrl}/daycares/${citySlug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }
  
  for (const daycare of daycares) {
    const programNumber = daycare['PROGRAM NUMBER'] || ''
    const name = daycare['PROGRAM NAME'] || ''
    const citySlug = resolveCanonicalCitySlugFromName(daycare['CITY'] || '')
    
    if (!programNumber) continue
    
    const slug = `${programNumber}-${slugify(name)}-${citySlug}`
    urls.push({
      url: `${baseUrl}/daycare/${slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }
  
  return urls
}
