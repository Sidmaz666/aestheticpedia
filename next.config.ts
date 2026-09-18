import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // DuckDB ships native binaries — load it from node_modules at runtime instead of bundling.
  serverExternalPackages: ['@duckdb/node-api', '@duckdb/node-bindings'],
  // Serverless functions (e.g. on Vercel) read the Parquet build from disk — ship it with every route.
  outputFileTracingIncludes: {
    '/**': ['./public/data/aesthetics.parquet', './public/data/relations.parquet', './public/data/manifest.json', './public/data/validation.json', './public/data/materials.json'],
  },
  poweredByHeader: false,
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/data/:file*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // On-device agent engine (see public/vendor/needle/README.md).
        source: '/vendor/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
    ]
  },
  async rewrites() {
    return [{ source: '/.well-known/mcp', destination: '/.well-known/mcp.json' }]
  },
}

export default nextConfig
