/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy - allows necessary third-party scripts
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com *.googlesyndication.com *.clarity.ms",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: *.google-analytics.com *.googlesyndication.com *.clarity.ms",
              "connect-src 'self' *.google-analytics.com *.googlesyndication.com *.clarity.ms",
              "frame-src 'self' *.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          },
          // Prevent XSS attacks
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Prevent content type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Prevent framing (clickjacking protection)
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Prevent DNS prefetching for privacy
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off'
          },
          // Security headers for downloads
          {
            key: 'X-Download-Options',
            value: 'noopen'
          },
          // Permissions policy to restrict features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig