// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    // nothing special here; remove deprecated flags
  },
  webpack: (config) => {
    // Ensure 'bcrypt' resolves to 'bcryptjs' to avoid native builds in Docker
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['bcrypt'] = 'bcryptjs';
    return config;
  },
};

export default nextConfig;
