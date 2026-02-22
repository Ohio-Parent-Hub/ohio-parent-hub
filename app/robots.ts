import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/draft', '/draft/', '/design-preview', '/design-preview/'],
      },
    ],
    sitemap: 'https://ohioparenthub.com/sitemap.xml',
  }
}
