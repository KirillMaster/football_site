/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
      },
      {
        protocol: 'https',
        hostname: 'static.tildacdn.com',
      },
      {
        protocol: 'https',
        hostname: 'optim.tildacdn.pub',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'https://fcarsenal92.ru',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? '',
    NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID ?? '',
  },
};

export default nextConfig;
