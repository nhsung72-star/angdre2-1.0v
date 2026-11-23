const ALLOWED_LOCAL_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function normalizeOrigin(rawUrl: string | undefined): string | null {
  if (!rawUrl) {
    return null;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'MY_APP_URL') {
    return null;
  }
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }

  try {
    const requestOrigin = new URL(request.url).origin;
    if (origin === requestOrigin) {
      return origin;
    }
  } catch {
    // Ignore malformed request URL
  }

  if (ALLOWED_LOCAL_ORIGINS.has(origin)) {
    return origin;
  }

  const configuredOrigins = [
    normalizeOrigin(process.env.APP_URL),
    normalizeOrigin(process.env.VERCEL_URL),
    normalizeOrigin(process.env.VERCEL_BRANCH_URL),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ].filter((value): value is string => value !== null);

  if (configuredOrigins.includes(origin)) {
    return origin;
  }

  return null;
}

export function buildCorsHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };

  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  return headers;
}

export function jsonResponse(
  payload: unknown,
  status: number,
  request: Request,
  cacheControl = 'no-store',
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheControl,
      ...buildCorsHeaders(request),
    },
  });
}

export function handleOptions(request: Request): Response {
  const origin = request.headers.get('origin');
  const allowedOrigin = getAllowedOrigin(request);

  if (origin && !allowedOrigin) {
    return new Response(null, {
      status: 403,
      headers: {
        Vary: 'Origin',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}
