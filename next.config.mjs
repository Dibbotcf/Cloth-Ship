/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // sharp is used by the admin image-upload route for compression; keep it external
  // so the standalone bundle loads the native binary correctly on the server.
  serverExternalPackages: ['sharp'],
};

export default nextConfig;
