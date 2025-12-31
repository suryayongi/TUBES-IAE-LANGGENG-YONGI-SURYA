import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://auth-service:8002/:path*', // Koneksi Internal Docker
      },
      {
        source: '/api/inventory/:path*',
        destination: 'http://inventory-service:8001/:path*', // Koneksi Internal Docker
      },
      {
        source: '/api/order/:path*',
        destination: 'http://order-service:8000/:path*', // Koneksi Internal Docker
      },
    ];
  },
};

export default nextConfig;