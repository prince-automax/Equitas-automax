/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    reactStrictMode: true,
    swcMinify: true,
    trailingSlash: true,
    env: {
        BASE_URL: "http://13.233.33.61",
        API_URL:"http://13.233.33.61/api/graphql",
        
     },
    images: {
        domains: [
            "chnimgs3bkt.s3.ap-south-1.amazonaws.com",
            "api.autobse.com",
            "photos.google.com",
            "firebasestorage.googleapis.com",
            "api-dev.autobse.com",
            "ops.adroitauto.in",
            "autobseimagesandexcel-dev.s3.ap-south-1.amazonaws.com",
            "api-dev.autobse.comhttps"
        ],
    },
};

module.exports = nextConfig;