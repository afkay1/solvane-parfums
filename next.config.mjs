/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images in /public/images are pre-sized WebP files, served as-is.
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default nextConfig;
