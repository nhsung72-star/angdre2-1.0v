import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type { OutfitRecommendation } from '../../src/types.js';

export interface RecommendRequestBody {
  ageGroup?: unknown;
  gender?: unknown;
  styleName?: unknown;
  styleDescription?: unknown;
  weather?: {
    dateLabel?: unknown;
    isToday?: unknown;
    temperature?: unknown;
    apparentTemperature?: unknown;
    weatherLabel?: unknown;
    minTemp?: unknown;
    maxTemp?: unknown;
    precipitationProbability?: unknown;
  };
}

export type RecommendServiceResult =
  | { ok: true; data: OutfitRecommendation }
  | { ok: false; status: number; error: string };

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isNonEmptyString(value: unknown, maxLen = 100): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLen;
}

export async function generateOutfitRecommendation(
  rawBody: unknown,
): Promise<RecommendServiceResult> {
  const ai = getAiClient();
  if (!ai) {
    return {
      ok: false,
      status: 500,
      error: '서버에 GEMINI_API_KEY 환경 변수가 설정되어 있지 않습니다.',
    };
  }

  if (!rawBody || typeof rawBody !== 'object') {
    return {
      ok: false,
      status: 400,
      error: '추천에 필요한 요청 데이터가 올바르지 않습니다.',
    };
  }

  const body = rawBody as RecommendRequestBody;
  const { ageGroup, gender, styleName, styleDescription, weather } = body;

  if (
    !isNonEmptyString(ageGroup, 40) ||
    !isNonEmptyString(gender, 40) ||
    !isNonEmptyString(styleName, 60) ||
    !weather ||
    typeof weather !== 'object' ||
    typeof weather.temperature !== 'number' ||
    !Number.isFinite(weather.temperature) ||
    typeof weather.apparentTemperature !== 'number' ||
    !Number.isFinite(weather.apparentTemperature) ||
    !isNonEmptyString(weather.weatherLabel, 40) ||
    typeof weather.minTemp !== 'number' ||
    !Number.isFinite(weather.minTemp) ||
    typeof weather.maxTemp !== 'number' ||
    !Number.isFinite(weather.maxTemp) ||
    typeof weather.precipitationProbability !== 'number' ||
    !Number.isFinite(weather.precipitationProbability)
  ) {
    return {
      ok: false,
      status: 400,
      error: '추천에 필요한 사용자 정보 또는 날씨 정보가 부족합니다.',
    };
  }

  const safeStyleDesc = isNonEmptyString(styleDescription, 120)
    ? styleDescription.trim()
    : '';
  const safeDateLabel = isNonEmptyString(weather.dateLabel, 40)
    ? weather.dateLabel.trim()
    : '';

  const tempGap = weather.maxTemp - weather.minTemp;
  const dayLabel =
    weather.isToday === false && safeDateLabel
      ? `${safeDateLabel} 예상 날씨`
      : '오늘 날씨';
  const tempHeading = weather.isToday === false ? '낮 예상 기온' : '지금 기온';

  const prompt = [
    `아래 사용자 정보와 ${dayLabel} 정보를 바탕으로 옷차림을 정확히 1가지 추천해 주세요.`,
    '',
    '[사용자 정보]',
    `- 연령대: ${ageGroup.trim()}`,
    `- 성별: ${gender.trim()}`,
    `- 선호 스타일: ${styleName.trim()}${safeStyleDesc ? ` (${safeStyleDesc})` : ''}`,
    '',
    `[${dayLabel}]`,
    `- ${tempHeading}: ${weather.temperature}℃`,
    `- 체감온도: ${weather.apparentTemperature}℃`,
    `- 날씨 상태: ${weather.weatherLabel.trim()}`,
    `- 최저 기온: ${weather.minTemp}℃`,
    `- 최고 기온: ${weather.maxTemp}℃`,
    `- 일교차: ${tempGap}℃`,
    `- 비 올 확률: ${weather.precipitationProbability}%`,
    '',
    '[지침]',
    '1. 고른 스타일로 옷차림을 정확히 1가지, 겉옷(outerwear)·상의(top)·하의(bottom)·신발(shoes)·소품(accessories)으로 나누어 추천하세요.',
    '2. 오늘 기온과 날씨에 꼭 맞게 추천하세요. 비 올 확률이 높거나 비/눈 소식이 있으면 우산이나 방수 신발을 꼭 포함하세요.',
    '3. 아침저녁과 낮의 기온 차이(일교차)가 크면 겉옷이나 얇은 옷을 여러 겹 껴입는 코디를 추천하세요.',
    '4. 연령대와 성별에 자연스럽게 어울리면서 누구나 쉽게 구할 수 있는 평범한 옷으로 추천하세요. 특정 브랜드 이름은 절대 넣지 마세요.',
    '5. reason(추천 이유)은 오늘 날씨를 근거로 한 문장으로만 작성하세요.',
    '6. 모든 텍스트는 정중하고 쉬운 한국어 존댓말로 작성하세요.',
    '7. illustration 필드에는 위에서 추천한 옷의 종류와 실제 어울리는 색상(6자리 #HEX 코드)을 채워 주세요. 더운 날 겉옷이 불필요하면 outerwearKind를 "none"으로, 우산을 추천했으면 accessoryKind를 "umbrella"로 설정하세요.',
  ].join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction:
          '당신은 한국 사용자의 연령대와 날씨를 세심하게 배려하는 실용적인 데일리 코디 스타일리스트입니다. 요청한 JSON 스키마에 맞춰 한국어 존댓말로 간결하고 정확하게 답하세요.',
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outerwear: {
              type: Type.STRING,
              description:
                '겉옷 추천 (예: 얇은 베이지 면 가디건). 겉옷이 필요 없는 무더위라면 그에 맞는 안내.',
            },
            top: {
              type: Type.STRING,
              description: '상의 추천 (예: 흰색 면 긴팔 티셔츠)',
            },
            bottom: {
              type: Type.STRING,
              description: '하의 추천 (예: 편안한 진청 일자 청바지)',
            },
            shoes: {
              type: Type.STRING,
              description: '신발 추천 (예: 발이 편한 흰색 운동화)',
            },
            accessories: {
              type: Type.STRING,
              description: '소품 추천 (예: 가벼운 접이식 우산 또는 얇은 목스카프)',
            },
            reason: {
              type: Type.STRING,
              description: '오늘 날씨를 근거로 한 한 문장의 쉬운 존댓말 추천 이유',
            },
            illustration: {
              type: Type.OBJECT,
              properties: {
                outerwearKind: {
                  type: Type.STRING,
                  enum: [
                    'none',
                    'cardigan',
                    'jacket',
                    'blazer',
                    'trench',
                    'coat',
                    'padding',
                    'windbreaker',
                  ],
                },
                outerwearColor: {
                  type: Type.STRING,
                  description: 'Hex color code like #C9AE8B',
                },
                topKind: {
                  type: Type.STRING,
                  enum: ['tshirt', 'knit', 'shirt', 'hoodie', 'blouse'],
                },
                topColor: {
                  type: Type.STRING,
                  description: 'Hex color code like #F4F4F5',
                },
                bottomKind: {
                  type: Type.STRING,
                  enum: ['slacks', 'jeans', 'chinos', 'jogger', 'skirt'],
                },
                bottomColor: {
                  type: Type.STRING,
                  description: 'Hex color code like #334155',
                },
                shoesKind: {
                  type: Type.STRING,
                  enum: ['sneakers', 'loafers', 'boots', 'running'],
                },
                shoesColor: {
                  type: Type.STRING,
                  description: 'Hex color code like #E4E4E7',
                },
                accessoryKind: {
                  type: Type.STRING,
                  enum: [
                    'none',
                    'umbrella',
                    'scarf',
                    'cap',
                    'bag',
                    'sunglasses',
                  ],
                },
                accessoryColor: {
                  type: Type.STRING,
                  description: 'Hex color code like #1E3A8A',
                },
                mood: {
                  type: Type.STRING,
                  enum: ['sunny', 'partly_cloudy', 'cloudy', 'rainy', 'snowy'],
                },
              },
              required: [
                'outerwearKind',
                'outerwearColor',
                'topKind',
                'topColor',
                'bottomKind',
                'bottomColor',
                'shoesKind',
                'shoesColor',
                'accessoryKind',
                'accessoryColor',
                'mood',
              ],
            },
          },
          required: [
            'outerwear',
            'top',
            'bottom',
            'shoes',
            'accessories',
            'reason',
            'illustration',
          ],
        },
      },
    });

    const rawText = (response.text ?? '').trim();
    if (!rawText) {
      return {
        ok: false,
        status: 502,
        error: 'AI 응답이 비어 있습니다.',
      };
    }

    const parsed = JSON.parse(rawText) as OutfitRecommendation;
    if (
      !parsed.outerwear ||
      !parsed.top ||
      !parsed.bottom ||
      !parsed.shoes ||
      !parsed.accessories ||
      !parsed.reason ||
      !parsed.illustration
    ) {
      return {
        ok: false,
        status: 502,
        error: 'AI 응답 형식이 올바르지 않습니다.',
      };
    }

    return {
      ok: true,
      data: parsed,
    };
  } catch (error) {
    console.error('Gemini recommendation error:', error);
    return {
      ok: false,
      status: 502,
      error: '추천을 생성하는 중 오류가 발생했습니다.',
    };
  }
}
