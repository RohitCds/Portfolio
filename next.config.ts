/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,  // This ignores ALL those ESLint warnings
  },
};

module.exports = nextConfig;