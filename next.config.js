/** @type {import('next').NextConfig} */
const nextConfig = {
  
  eslint: {
    ignoreDuringBuilds: true,  
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Force standalone output
  output: 'standalone',

}

module.exports = nextConfig