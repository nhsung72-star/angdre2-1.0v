import type { WeatherData } from '../types';

export function getKoreaTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day + days));
  return utcDate.toISOString().slice(0, 10);
}

export function formatKoreanDateLabel(
  dateStr: string,
  todayStr: string = getKoreaTodayDateString(),
): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[utcDate.getUTCDay()];
  const tomorrowStr = addDaysToDateString(todayStr, 1);
  const dayAfterStr = addDaysToDateString(todayStr, 2);

  if (dateStr === todayStr) {
    return `오늘 (${month}월 ${day}일 ${weekday})`;
  }
  if (dateStr === tomorrowStr) {
    return `내일 (${month}월 ${day}일 ${weekday})`;
  }
  if (dateStr === dayAfterStr) {
    return `모레 (${month}월 ${day}일 ${weekday})`;
  }
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatShortKoreanDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  return `${month}월 ${day}일`;
}

export async function fetchOpenMeteoWeather(
  latitude: number,
  longitude: number,
  targetDate?: string,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const todayStr = getKoreaTodayDateString();
  const dateStr = targetDate || todayStr;

  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    date: dateStr,
  });

  const response = await fetch(`/api/weather?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    let errorMessage = '날씨 정보를 불러오지 못했어요. 다시 시도해 주세요.';
    try {
      const errorData = (await response.json()) as { error?: string };
      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore non-JSON error responses
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as WeatherData;
  if (
    typeof data?.temperature !== 'number' ||
    typeof data?.apparentTemperature !== 'number' ||
    typeof data?.minTemp !== 'number' ||
    typeof data?.maxTemp !== 'number'
  ) {
    throw new Error('날씨 데이터 형식이 올바르지 않습니다.');
  }

  return data;
}
