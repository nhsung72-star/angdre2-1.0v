import { AlertCircle, Home, Loader2, RefreshCw } from 'lucide-react';
import { OUTFIT_STYLES } from '../data/styles';
import { formatShortKoreanDate } from '../services/weather';
import type {
  OutfitRecommendation,
  SelectedLocation,
  UserProfile,
  WeatherData,
} from '../types';
import { OutfitLookbookSvg } from './OutfitLookbookSvg';
import { StyleIllustration } from './StyleIllustration';

interface RecommendationStepProps {
  profile: UserProfile;
  location: SelectedLocation;
  weather: WeatherData;
  status: 'loading' | 'success' | 'error';
  errorMessage?: string | null;
  recommendation: OutfitRecommendation | null;
  onRetry: () => void;
  onRestart: () => void;
}

function getAccessoryEmoji(text: string): string {
  if (text.includes('우산')) return '☂️';
  if (text.includes('목도리') || text.includes('스카프') || text.includes('머플러')) {
    return '🧣';
  }
  if (text.includes('모자') || text.includes('캡')) return '🧢';
  if (text.includes('선글라스') || text.includes('안경')) return '🕶️';
  if (text.includes('장갑')) return '🧤';
  return '👜';
}

export function RecommendationStep({
  profile,
  location,
  weather,
  status,
  errorMessage,
  recommendation,
  onRetry,
  onRestart,
}: RecommendationStepProps) {
  const isLoading = status === 'loading';
  const chosenStyle =
    OUTFIT_STYLES.find((s) => s.id === profile.style) ?? OUTFIT_STYLES[0];

  const items = recommendation
    ? [
        { emoji: '🧥', label: '겉옷', value: recommendation.outerwear },
        { emoji: '👕', label: '상의', value: recommendation.top },
        { emoji: '👖', label: '하의', value: recommendation.bottom },
        { emoji: '👟', label: '신발', value: recommendation.shoes },
        {
          emoji: getAccessoryEmoji(recommendation.accessories),
          label: '소품',
          value: recommendation.accessories,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-blue-800">
          3단계 · 앙드레 추천 옷차림
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl text-balance">
          오늘 날씨에 맞춘 추천 옷차림
        </h1>
      </div>

      {/* 맨 위 날씨 요약 한 줄 */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-5 py-4">
        <p className="text-base font-bold text-zinc-900 tabular-nums sm:text-lg">
          {weather.isToday ? (
            <>
              {location.label} · {weather.weatherEmoji} 지금{' '}
              {weather.temperature}℃ (체감 {weather.apparentTemperature}℃) ·{' '}
              {weather.weatherLabel} / 최저 {weather.minTemp}℃ · 최고{' '}
              {weather.maxTemp}℃ · 비 올 확률{' '}
              {weather.precipitationProbability}%
            </>
          ) : (
            <>
              {location.label} · {formatShortKoreanDate(weather.date)} ·{' '}
              {weather.weatherEmoji} 낮 예상 {weather.temperature}℃ (체감{' '}
              {weather.apparentTemperature}℃) · {weather.weatherLabel} / 최저{' '}
              {weather.minTemp}℃ · 최고 {weather.maxTemp}℃ · 비 올 확률{' '}
              {weather.precipitationProbability}%
            </>
          )}
        </p>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center"
        >
          <Loader2 className="h-11 w-11 animate-spin text-blue-800" />
          <p className="text-xl font-extrabold text-zinc-900 sm:text-2xl">
            AI가 옷을 고르는 중이에요…
          </p>
          <p className="text-base text-zinc-500">
            기온과 날씨, 고르신 스타일을 함께 살펴보고 있어요.
          </p>
        </div>
      )}

      {/* 실패 상태 */}
      {status === 'error' && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center"
        >
          <AlertCircle className="h-10 w-10 text-rose-700" />
          <p className="text-xl font-bold text-rose-950">
            지금은 추천할 수 없어요. 잠시 후 다시 눌러 주세요
          </p>
          {errorMessage && (
            <p className="text-sm font-medium text-rose-800">{errorMessage}</p>
          )}
        </div>
      )}

      {/* 추천 결과 카드 */}
      {status === 'success' && recommendation && (
        <article className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-7">
          {/* 카드 상단: 고른 스타일 그림과 이름 */}
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-5">
            <StyleIllustration styleId={chosenStyle.id} selected />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-blue-800">
                고르신 스타일 · {profile.ageGroup} · {profile.gender}
              </p>
              <h2 className="text-2xl font-extrabold text-zinc-900">
                {chosenStyle.name}
              </h2>
            </div>
          </div>

          {/* 본문: 추천한 옷 착용 이미지 + 겉옷/상의/하의/신발/소품 */}
          <div className="mt-6 grid grid-cols-1 gap-7 md:grid-cols-12 md:items-center">
            <div className="md:col-span-5">
              <OutfitLookbookSvg
                spec={recommendation.illustration}
                gender={profile.gender ?? '선택 안 함'}
                ageGroup={profile.ageGroup ?? '40대'}
              />
            </div>

            <ul className="divide-y divide-zinc-100 md:col-span-7">
              {items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-3.5 py-3.5 first:pt-0 last:pb-0"
                >
                  <span
                    className="text-2xl leading-none select-none"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-zinc-500">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-lg font-bold text-zinc-900 sm:text-xl">
                      {item.value}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* 맨 아래 추천 이유 */}
          <div className="mt-6 border-t border-zinc-200 pt-5">
            <p className="text-sm font-bold text-blue-900">💡 추천 이유</p>
            <p className="mt-1.5 text-lg leading-relaxed font-semibold text-zinc-800">
              {recommendation.reason}
            </p>
          </div>
        </article>
      )}

      {/* 맨 아래 버튼: 다시 추천받기 + 처음으로 */}
      <div className="grid grid-cols-1 gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-12">
        <button
          type="button"
          disabled={isLoading}
          onClick={onRestart}
          className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl border px-6 py-4 text-xl font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:col-span-5 ${
            isLoading
              ? 'cursor-not-allowed border-zinc-200 bg-zinc-100 text-zinc-400'
              : 'cursor-pointer border-zinc-300 bg-white text-zinc-800 hover:bg-stone-100 active:scale-[0.99]'
          }`}
        >
          <Home className="h-5 w-5 shrink-0" />
          <span>처음으로</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onRetry}
          className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xl font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:col-span-7 ${
            isLoading
              ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
              : 'cursor-pointer bg-blue-900 text-white shadow-md hover:bg-blue-800 active:scale-[0.99]'
          }`}
        >
          <RefreshCw className="h-5 w-5 shrink-0" />
          <span>다시 추천받기</span>
        </button>
      </div>
    </div>
  );
}
