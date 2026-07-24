import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Replace with your real deployed domain after going live.
  const baseUrl = 'https://your-domain.com';

  const routes = ['', '/login', '/register', '/contact', '/privacy', '/terms'];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
