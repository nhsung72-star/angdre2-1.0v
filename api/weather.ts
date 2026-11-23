import { handleOptions, jsonResponse } from './_lib/http.js';
import { getWeatherFromOpenMeteo } from './_lib/weather.js';

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const latParam = url.searchParams.get('latitude');
  const lonParam = url.searchParams.get('longitude');
  const dateParam = url.searchParams.get('date') ?? undefined;

  const latitude = latParam !== null ? Number(latParam) : Number.NaN;
  const longitude = lonParam !== null ? Number(lonParam) : Number.NaN;

  const result = await getWeatherFromOpenMeteo({
    latitude,
    longitude,
    targetDate: dateParam,
  });

  if (!result.ok) {
    return jsonResponse({ error: result.error }, result.status, request);
  }

  return jsonResponse(
    result.data,
    200,
    request,
    'public, s-maxage=300, stale-while-revalidate=60',
  );
}
