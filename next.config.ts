import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sign in / sign up only happen via the modals on the homepage.
  async redirects() {
    return [
      { source: "/sign-in/:path*", destination: "/", permanent: false },
      { source: "/sign-up/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
