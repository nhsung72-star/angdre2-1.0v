import type { WeatherData } from '../../src/types.js';

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    apparent_temperature?: number[];
    weather_code?: number[];
    precipitation_probability?: number[];
  };
  daily?: {
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
}

export type WeatherServiceResult =
  | { ok: true; data: WeatherData }
  | { ok: false; status: number; error: string };

export function getKoreaTodayDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function getKoreaCurrentHour(): number {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    hour12: false,
  }).format(new Date());
  const parsed = Number.parseInt(hourStr, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 23) {
    return 12;
  }
  return parsed;
}

function addDaysToDateString(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day + days));
  return utcDate.toISOString().slice(0, 10);
}

function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function mapWeatherCodeToKorean(code: number): {
  label: string;
  emoji: string;
} {
  if (code === 0) {
    return { label: '맑음', emoji: '☀️' };
  }
  if (code === 1) {
    return { label: '대체로 맑음', emoji: '🌤️' };
  }
  if (code === 2) {
    return { label: '구름 조금', emoji: '⛅' };
  }
  if (code === 3) {
    return { label: '흐림', emoji: '☁️' };
  }
  if (code === 45 || code === 48) {
    return { label: '안개', emoji: '🌫️' };
  }
  if (code === 51 || code === 53 || code === 55) {
    return { label: '이슬비', emoji: '🌦️' };
  }
  if (code === 56 || code === 57) {
    return { label: '진눈깨비', emoji: '🌧️' };
  }
  if (code === 61 || code === 63 || code === 65) {
    return { label: '비', emoji: '🌧️' };
  }
  if (code === 66 || code === 67) {
    return { label: '진눈깨비', emoji: '🌨️' };
  }
  if (code === 71 || code === 73 || code === 75 || code === 77) {
    return { label: '눈', emoji: '❄️' };
  }
  if (code === 80 || code === 81 || code === 82) {
    return { label: '소나기', emoji: '🌦️' };
  }
  if (code === 85 || code === 86) {
    return { label: '눈', emoji: '🌨️' };
  }
  if (code === 95 || code === 96 || code === 99) {
    return { label: '천둥번개', emoji: '⛈️' };
  }
  return { label: '구름', emoji: '⛅' };
}

export async function getWeatherFromOpenMeteo(params: {
  latitude: number;
  longitude: number;
  targetDate?: string;
}): Promise<WeatherServiceResult> {
  const { latitude, longitude, targetDate } = params;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      ok: false,
      status: 400,
      error: '올바른 위도와 경도 값이 필요합니다.',
    };
  }

  const todayStr = getKoreaTodayDateString();
  const maxDateStr = addDaysToDateString(todayStr, 15);
  const dateStr = targetDate?.trim() || todayStr;

  if (!isValidDateString(dateStr)) {
    return {
      ok: false,
      status: 400,
      error: '날짜 형식이 올바르지 않습니다.',
    };
  }

  if (dateStr < todayStr || dateStr > maxDateStr) {
    return {
      ok: false,
      status: 400,
      error: '오늘부터 15일 이내의 날짜만 조회할 수 있어요.',
    };
  }

  const isToday = dateStr === todayStr;

  try {
    if (isToday) {
      const searchParams = new URLSearchParams({
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        current: 'temperature_2m,apparent_temperature,weather_code',
        hourly: 'precipitation_probability',
        daily:
          'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'Asia/Seoul',
        forecast_days: '1',
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`,
        {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(8000),
        },
      );

      if (!response.ok) {
        return {
          ok: false,
          status: 502,
          error: '날씨 정보를 불러오지 못했어요. 다시 시도해 주세요.',
        };
      }

      const data = (await response.json()) as OpenMeteoResponse;
      const currentTemp = data.current?.temperature_2m;
      const apparentTemp = data.current?.apparent_temperature;
      const weatherCode = data.current?.weather_code ?? 0;
      const maxTemp = data.daily?.temperature_2m_max?.[0];
      const minTemp = data.daily?.temperature_2m_min?.[0];

      if (
        typeof currentTemp !== 'number' ||
        typeof apparentTemp !== 'number' ||
        typeof maxTemp !== 'number' ||
        typeof minTemp !== 'number'
      ) {
        return {
          ok: false,
          status: 502,
          error: '날씨 데이터 형식이 올바르지 않습니다.',
        };
      }

      const currentHour = getKoreaCurrentHour();
      const hourlyProb = data.hourly?.precipitation_probability?.[currentHour];
      const dailyMaxProb = data.daily?.precipitation_probability_max?.[0];
      const precipitationProbability =
        typeof hourlyProb === 'number'
          ? hourlyProb
          : typeof dailyMaxProb === 'number'
            ? dailyMaxProb
            : 0;

      const { label, emoji } = mapWeatherCodeToKorean(weatherCode);

      return {
        ok: true,
        data: {
          date: dateStr,
          isToday: true,
          temperature: Math.round(currentTemp),
          apparentTemperature: Math.round(apparentTemp),
          weatherCode,
          weatherLabel: label,
          weatherEmoji: emoji,
          minTemp: Math.round(minTemp),
          maxTemp: Math.round(maxTemp),
          precipitationProbability: Math.round(precipitationProbability),
        },
      };
    }

    const searchParams = new URLSearchParams({
      latitude: latitude.toFixed(4),
      longitude: longitude.toFixed(4),
      hourly:
        'temperature_2m,apparent_temperature,weather_code,precipitation_probability',
      daily:
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'Asia/Seoul',
      start_date: dateStr,
      end_date: dateStr,
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${searchParams.toString()}`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error:
          '선택한 날짜의 날씨를 가져오지 못했어요. 오늘부터 15일 이내 날짜를 골라 주세요.',
      };
    }

    const data = (await response.json()) as OpenMeteoResponse;
    const maxTemp = data.daily?.temperature_2m_max?.[0];
    const minTemp = data.daily?.temperature_2m_min?.[0];
    const dailyCode = data.daily?.weather_code?.[0];
    const dailyMaxProb = data.daily?.precipitation_probability_max?.[0];

    const middayTemp = data.hourly?.temperature_2m?.[12];
    const middayApparent = data.hourly?.apparent_temperature?.[12];
    const middayCode = data.hourly?.weather_code?.[12];

    if (typeof maxTemp !== 'number' || typeof minTemp !== 'number') {
      return {
        ok: false,
        status: 502,
        error: '날씨 데이터 형식이 올바르지 않습니다.',
      };
    }

    const representativeTemp =
      typeof middayTemp === 'number' ? middayTemp : (maxTemp + minTemp) / 2;
    const representativeApparent =
      typeof middayApparent === 'number' ? middayApparent : representativeTemp;
    const weatherCode =
      typeof dailyCode === 'number'
        ? dailyCode
        : typeof middayCode === 'number'
          ? middayCode
          : 0;
    const precipitationProbability =
      typeof dailyMaxProb === 'number' ? dailyMaxProb : 0;

    const { label, emoji } = mapWeatherCodeToKorean(weatherCode);

    return {
      ok: true,
      data: {
        date: dateStr,
        isToday: false,
        temperature: Math.round(representativeTemp),
        apparentTemperature: Math.round(representativeApparent),
        weatherCode,
        weatherLabel: label,
        weatherEmoji: emoji,
        minTemp: Math.round(minTemp),
        maxTemp: Math.round(maxTemp),
        precipitationProbability: Math.round(precipitationProbability),
      },
    };
  } catch (error) {
    console.error('Open-Meteo weather proxy error:', error);
    return {
      ok: false,
      status: 502,
      error: '날씨 서버와 통신하지 못했어요. 잠시 후 다시 시도해 주세요.',
    };
  }
}
