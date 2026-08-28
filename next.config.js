/** @type {import('next').NextConfig} */
const nextConfig = {
  // The FastAPI backend (api/index.py) is deployed as its own Vercel Python
  // serverless function, but Vercel only serves that function at /api/index —
  // nothing routes /api/py/* to it on its own, so those requests 404 without
  // this rewrite. In production we point them at the function; the original
  // /api/py/... path is preserved in the request the function receives, which
  // is why the FastAPI routes are declared with that prefix. In dev there's no
  // such function — `next dev` only runs the JS side — so the same paths go to
  // a local uvicorn process instead (see README.md for how to start it).
  async rewrites() {
    return [
      {
        source: "/api/py/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/py/:path*"
            : "/api/",
      },
    ];
  },
};

module.exports = nextConfig;
