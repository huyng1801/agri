import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  typedRoutes: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    root: path.resolve(projectDir, '..')
  }
};

export default nextConfig;
