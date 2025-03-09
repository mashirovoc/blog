/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["babylon-mmd"],
    },
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'placehold.jp',
            port: '',

        },
        {
            protocol: 'https',
            hostname: 'utfs.io',
            port: '',
        },
        {
            protocol: 'https',
            hostname: 'images.microcms-assets.io',
            port: '',
        },
        ],
    },
};

export default nextConfig;