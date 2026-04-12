/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID ?? '',
    NEXT_PUBLIC_YM_ID: process.env.NEXT_PUBLIC_YM_ID ?? '',
  },
};

export default nextConfig;
