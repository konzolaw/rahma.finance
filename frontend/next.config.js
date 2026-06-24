/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    let apiDestination = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    
    // Ensure the destination ends with /:path* so Next.js forwards path parameters correctly
    if (!apiDestination.endsWith('/:path*')) {
      apiDestination = apiDestination.replace(/\/$/, '') + '/:path*';
    }

    return [
      {
        source: '/api/v1/:path*',
        destination: apiDestination,
      },
    ];
  },
};

module.exports = nextConfig;
