const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'none'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "img-src 'self' data:",
    "manifest-src 'self'",
    "media-src 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-attr 'none'",
    "worker-src 'self'",
    "upgrade-insecure-requests",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function getCacheControl(pathname) {
  if (pathname.startsWith("/assets/")) {
    return "public, max-age=31536000, immutable";
  }

  if (pathname === "/" || pathname.endsWith(".html")) {
    return "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
  }

  if (pathname === "/icon.png") {
    return "public, max-age=86400";
  }

  return "public, max-age=300, s-maxage=900, stale-while-revalidate=86400";
}

function withSiteHeaders(response, pathname) {
  const headers = new Headers(response.headers);

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  headers.set("Cache-Control", getCacheControl(pathname));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.protocol !== "https:") {
      url.protocol = "https:";
      return new Response(null, {
        status: 301,
        headers: {
          ...SECURITY_HEADERS,
          Location: url.toString(),
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          ...SECURITY_HEADERS,
          Allow: "GET, HEAD",
          "Cache-Control": "no-store",
        },
      });
    }

    const response = await env.ASSETS.fetch(request);
    return withSiteHeaders(response, url.pathname);
  },
};

export default worker;
