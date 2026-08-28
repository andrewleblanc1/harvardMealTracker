/** @type {import('next').NextConfig} */
const nextConfig = {
  // The FastAPI backend (api/index.py) is deployed as its own Vercel Python
  // serverless function, so in production Vercel already routes /api/py/*
  // straight to it. In dev there's no such function — `next dev` only runs
  // the JS side — so this rewrites those requests to a local uvicorn process
  // instead (see README.md for how to start it).
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api/py/:path*",
        destination: "http://127.0.0.1:8000/api/py/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
