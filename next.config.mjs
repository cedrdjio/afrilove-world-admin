/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // Server Actions default to a 1 MB body limit — too small for image
    // uploads. Allow comfortably more than our per-file cap (8 MB) so a valid
    // image never triggers a raw 413. Oversized files are rejected client-side
    // with a friendly message before they ever reach the server.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;

