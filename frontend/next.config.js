/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
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

    return [
      {
        source: '/api/v1/:path*',
        destination: apiDestination,
      },
    ];
  },
};

module.exports = nextConfig;
