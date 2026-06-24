/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    let apiDestination = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // 1. Remove any trailing /:path* or :path*
    apiDestination = apiDestination.replace(/\/?:path\*$/, '');
    
    // 2. Remove any trailing slash
    apiDestination = apiDestination.replace(/\/$/, '');
    
    // 3. Ensure the /api/v1 path prefix exists
    if (!apiDestination.includes('/api/v1')) {
      apiDestination = apiDestination + '/api/v1';
    }
    
    // 4. Append the path wildcard parameter for Next.js proxying
    apiDestination = apiDestination + '/:path*';

    // 5. Clean base destination for split rewrites
    const cleanDestination = apiDestination.replace(/\/?:path\*$/, '');

    return [
      // Rule 1: Explicitly preserve trailing slash when present
      {
        source: '/api/v1/:path*/',
        destination: `${cleanDestination}/:path*/`,
      },
      // Rule 2: Fallback for non-trailing-slashed requests
      {
        source: '/api/v1/:path*',
        destination: `${cleanDestination}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
