/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  // No usar experimental.appDir: Next 14 App Router ya está activo por /app
  // y esta flag produciría warnings.
};

export default nextConfig;
