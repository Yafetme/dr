/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "cdn.prod.website-files.com",
            },
            {
                protocol: "https",
                hostname: "encrypted-tbn0.gstatic.com",
            },
            {
                protocol: "https",
                hostname: "weetracker.com",
            },
            {
                protocol: "https",
                hostname: "www.shutterstock.com",
            },
            {
                protocol: "https",
                hostname: "cryptologos.cc",
            },
        ],
    },
};

export default nextConfig;
