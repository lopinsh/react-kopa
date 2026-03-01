import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/groups/:slug',
        destination: '/api/resolve-group/:slug?locale=lv',
        permanent: true,
      },
      {
        source: '/:locale/groups/:slug',
        destination: '/api/resolve-group/:slug?locale=:locale',
        permanent: true,
      },
      {
        source: '/groups/:slug/:path*',
        destination: '/api/resolve-group/:slug?locale=lv&path=:path*',
        permanent: true,
      },
      {
        source: '/:locale/groups/:slug/:path*',
        destination: '/api/resolve-group/:slug?locale=:locale&path=:path*',
        permanent: true,
      }
    ];
  },
};

export default withNextIntl(nextConfig);
