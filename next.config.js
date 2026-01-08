/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "/analyzer",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
