/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  rewrites: async () => {
    return [
      {
        source: "/",
        destination: "/index.html",
      },
      {
        source: "/api/map/style",
        destination: "/api/osm/style",
      },
    ];
  },
  ...(process.env.NODE_ENV !== "production" && {
    async headers() {
      return [
        {
          source: "/api/:path*",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
            {
              key: "Access-Control-Allow-Headers",
              value:
                "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
            },
          ],
        },
      ];
    },
  }),
  experimental: {
    nextScriptWorkers: true,
    instrumentationHook: true,
    serverComponentsExternalPackages: ["pino", "pino-pretty", "pino-prisma"],
  },
};

module.exports = nextConfig;
