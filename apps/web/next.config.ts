import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Configure headers for permissions
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          // Permissions Policy - only use widely supported features
          {
            key: "Permissions-Policy",
            value: [
              "clipboard-read=*",
              "clipboard-write=*",
              "fullscreen=*",
              "display-capture=*",
              "camera=*",
              "microphone=*",
              "geolocation=*",
              "accelerometer=*",
              "gyroscope=*",
              "magnetometer=*",
              "midi=*",
              "usb=*",
              "serial=*",
              "hid=*",
              "payment=*",
              "picture-in-picture=*",
              "autoplay=*",
              "encrypted-media=*",
              "xr-spatial-tracking=*",
            ].join(", "),
          },
        ],
      },
      {
        // Apply more relaxed headers to the room pages specifically
        source: "/room/:roomId*",
        headers: [
          // Disable COEP for room pages to allow cross-origin iframes
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          // Content Security Policy - very permissive for IDE functionality
          {
            key: "Content-Security-Policy",
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
              "script-src * 'unsafe-inline' 'unsafe-eval' blob:",
              "style-src * 'unsafe-inline'",
              "img-src * data: blob:",
              "font-src * data:",
              "connect-src *",
              "frame-src *",
              "frame-ancestors *",
              "worker-src * blob:",
              "child-src * blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        // Proxy Socket.io polling requests to the ECS server
        // This avoids Mixed Content blocks in the browser
        source: "/socket.io/:path*",
        destination: `http://${process.env.SOCKET_SERVER_IP || "13.235.70.235"}:3001/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
