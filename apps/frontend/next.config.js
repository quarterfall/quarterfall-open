const { i18n } = require("./next-i18next.config");

const securityHeaders = [
    {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
    },
    {
        key: "Content-Security-Policy",
        value: "form-action 'self'",
    },
    {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "same-origin",
    },
    {
        key: "Permissions-Policy",
        value: "geolocation=(), camera=(), microphone=(), fullscreen=()",
    },
];

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
    poweredByHeader: false,
    async headers() {
        return [
            {
                // Apply these headers to all routes in your application.
                source: "/(.*)",
                headers: securityHeaders,
            },
            {
                // Apply these headers to all routes in your application.
                source: "/",
                headers: securityHeaders,
            },
        ];
    },
    i18n,
    async redirects() {
        return [
            {
                source: "/student",
                destination: "/",
                permanent: true,
            },
        ];
    },
    transpilePackages: ["core"],
    webpack: (config, { buildId, dev }) => {
        config.resolve.symlinks = false;
        return config;
    },
});
