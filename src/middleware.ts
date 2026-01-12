import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers middleware
 * Adds security headers to all responses
 */
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Content Security Policy
  // Allows: self, Supabase, inline styles (needed for Tailwind)
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  // Only use strict CSP in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      cspDirectives.join("; ")
    );
  }

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // XSS Protection (legacy but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy - disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", ")
  );

  // HSTS - enforce HTTPS (only in production)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

/**
 * Configure which paths the middleware runs on
 * Exclude static files and API routes that handle their own headers
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
