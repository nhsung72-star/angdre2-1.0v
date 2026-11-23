import { useRef, useState } from 'react';
import { AboutMeStep } from './components/AboutMeStep';
import { RecommendationStep } from './components/RecommendationStep';
import { WeatherStep } from './components/WeatherStep';
import { OUTFIT_STYLES } from './data/styles';
import { formatShortKoreanDate } from './services/weather';
import type {
  AgeGroup,
  Gender,
  OutfitRecommendation,
  OutfitStyleId,
  SelectedLocation,
  UserProfile,
  WeatherData,
} from './types';

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<UserProfile>({
    ageGroup: null,
    gender: null,
    style: null,
  });

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendStatus, setRecommendStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<OutfitRecommendation | null>(null);

  const requestInFlightRef = useRef(false);

  const handleAgeGroupChange = (ageGroup: AgeGroup) => {
    setProfile((prev) => ({ ...prev, ageGroup }));
  };

  const handleGenderChange = (gender: Gender) => {
    setProfile((prev) => ({ ...prev, gender }));
  };

  const handleStyleChange = (style: OutfitStyleId) => {
    setProfile((prev) => ({ ...prev, style }));
  };

  const handleGoNext = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const requestRecommendation = async (
    targetLocation: SelectedLocation,
    targetWeather: WeatherData,
  ) => {
    if (requestInFlightRef.current) {
      return;
    }

    const styleOption = OUTFIT_STYLES.find((s) => s.id === profile.style);
    if (!profile.ageGroup || !profile.gender || !styleOption) {
      return;
    }

    requestInFlightRef.current = true;
    setRecommendStatus('loading');
    setRecommendError(null);
    setRecommendation(null);

    try {
      const response = await fetch('/api/recommend-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageGroup: profile.ageGroup,
          gender: profile.gender,
          styleName: styleOption.name,
          styleDescription: styleOption.description,
          weather: {
            dateLabel: formatShortKoreanDate(targetWeather.date),
            isToday: targetWeather.isToday,
            temperature: targetWeather.temperature,
            apparentTemperature: targetWeather.apparentTemperature,
            weatherLabel: targetWeather.weatherLabel,
            minTemp: targetWeather.minTemp,
            maxTemp: targetWeather.maxTemp,
            precipitationProbability: targetWeather.precipitationProbability,
          },
        }),
      });

      if (!response.ok) {
        let serverError: string | null = null;
        try {
          const errorBody = (await response.json()) as { error?: string };
          if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
            serverError = errorBody.error;
          }
        } catch {
          // Ignore non-JSON error body
        }
        setRecommendError(serverError);
        setRecommendStatus('error');
        return;
      }

      const data = (await response.json()) as OutfitRecommendation;
      setRecommendation(data);
      setRecommendStatus('success');
    } catch {
      setRecommendError(null);
      setRecommendStatus('error');
    } finally {
      requestInFlightRef.current = false;
    }
  };

  const handleStartRecommendation = (
    locationData: SelectedLocation,
    weatherData: WeatherData,
  ) => {
    setSelectedLocation(locationData);
    setWeather(weatherData);
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void requestRecommendation(locationData, weatherData);
  };

  const handleRetryRecommendation = () => {
    if (!selectedLocation || !weather) {
      return;
    }
    void requestRecommendation(selectedLocation, weather);
  };

  const handleRestart = () => {
    if (requestInFlightRef.current) {
      return;
    }
    setProfile({
      ageGroup: null,
      gender: null,
      style: null,
    });
    setSelectedLocation(null);
    setWeather(null);
    setRecommendError(null);
    setRecommendation(null);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-dvh bg-[#f8f7f4] text-zinc-900">
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-[#f8f7f4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6">
          <span className="text-xl font-extrabold tracking-tight text-zinc-900 whitespace-nowrap shrink-0">
            앙드레2
          </span>

          <nav
            aria-label="진행 단계"
            className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 sm:gap-2 sm:text-sm"
          >
            <span
              className={step === 1 ? 'text-blue-900' : 'text-zinc-400'}
              aria-current={step === 1 ? 'step' : undefined}
            >
              1. 나에 대해
            </span>
            <span aria-hidden="true" className="text-zinc-300">
              ·
            </span>
            <span
              className={step === 2 ? 'text-blue-900' : 'text-zinc-400'}
              aria-current={step === 2 ? 'step' : undefined}
            >
              2. 오늘 날씨
            </span>
            <span aria-hidden="true" className="text-zinc-300">
              ·
            </span>
            <span
              className={step === 3 ? 'text-blue-900' : 'text-zinc-400'}
              aria-current={step === 3 ? 'step' : undefined}
            >
              3. 추천 옷차림
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        {step === 1 && (
          <AboutMeStep
            profile={profile}
            onChangeAgeGroup={handleAgeGroupChange}
            onChangeGender={handleGenderChange}
            onChangeStyle={handleStyleChange}
            onNext={handleGoNext}
          />
        )}

        {step === 2 && (
          <WeatherStep
            onBack={handleGoBack}
            onRecommend={handleStartRecommendation}
          />
        )}

        {step === 3 && selectedLocation && weather && (
          <RecommendationStep
            profile={profile}
            location={selectedLocation}
            weather={weather}
            status={recommendStatus}
            errorMessage={recommendError}
            recommendation={recommendation}
            onRetry={handleRetryRecommendation}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}
