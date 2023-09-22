/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["codeium.com"],
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
