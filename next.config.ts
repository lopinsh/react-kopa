import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  // Lets `next dev` be opened as 127.0.0.1 too (a second cookie jar for signed-out / sign-up checks next to localhost).
  allowedDevOrigins: ['127.0.0.1'],
  // The Handbook pages read markdown from disk at request time; the standalone trace can't see that.
  outputFileTracingIncludes: {
    '/[locale]/admin/handbook': ['./docs/handbook/**/*'],
    '/[locale]/admin/handbook/[chapter]': ['./docs/handbook/**/*'],
    '/[locale]/admin/development/redesign': ['./docs/development/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
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
      // The redesign page moved out of the Handbook into Admin > Development.
      {
        source: '/:locale(lv|en)/admin/handbook/redesign',
        destination: '/:locale/admin/development/redesign',
        permanent: false,
      },
      {
        source: '/admin/handbook/redesign',
        destination: '/admin/development/redesign',
        permanent: false,
      },
      // Announcements used to be the Discussions tab; the query string is kept by Next.
      {
        source: '/:locale(lv|en)/:l1Slug/group/:groupSlug/discussions',
        destination: '/:locale/:l1Slug/group/:groupSlug/announcements',
        permanent: true,
      },
      {
        source: '/:l1Slug/group/:groupSlug/discussions',
        destination: '/:l1Slug/group/:groupSlug/announcements',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
