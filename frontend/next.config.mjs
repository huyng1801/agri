/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  typedRoutes: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost']
};

export default nextConfig;
