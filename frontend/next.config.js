/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    disableStaticImages: true,
  },
  experimental: {
    optimizePackageImports: ["@heroui/react"],
  },
  transpilePackages: ['@heroui/react', '@heroui/theme', '@ant-design', 'antd', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-tree', 'rc-table'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://172.18.166.219:8288/api/v1/:path*', // Proxy to backend
      },
      {
        source: '/api2/v1/:path*',
        destination: 'http://172.18.166.219:8288/api2/v1/:path*', // Proxy to backend 2
      }
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|webp)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]'
      }
    });

    // 解决一些 Node.js polyfill 在浏览器端缺失的问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
};

module.exports = nextConfig;
