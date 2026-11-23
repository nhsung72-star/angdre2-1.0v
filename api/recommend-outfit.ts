import { handleOptions, jsonResponse } from './_lib/http.js';
import { generateOutfitRecommendation } from './_lib/recommend.js';

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request);
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: '요청 본문 JSON 형식이 올바르지 않습니다.' },
      400,
      request,
    );
  }

  const result = await generateOutfitRecommendation(body);
  if (!result.ok) {
    return jsonResponse({ error: result.error }, result.status, request);
  }

  return jsonResponse(result.data, 200, request);
}
