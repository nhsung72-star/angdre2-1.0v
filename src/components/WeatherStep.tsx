import {
  ArrowLeft,
  Calendar,
  CloudSun,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Square,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CITIES } from '../data/regions';
import {
  addDaysToDateString,
  fetchOpenMeteoWeather,
  formatKoreanDateLabel,
  formatShortKoreanDate,
  getKoreaTodayDateString,
} from '../services/weather';
import type {
  CityOption,
  SelectedLocation,
  SubRegion,
  WeatherData,
} from '../types';

interface WeatherStepProps {
  onBack: () => void;
  onRecommend: (location: SelectedLocation, weather: WeatherData) => void;
}

export function WeatherStep({ onBack, onRecommend }: WeatherStepProps) {
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [selectedSeoulDistrict, setSelectedSeoulDistrict] = useState<string>(
    '강남구',
  );
  const [seoulSearch, setSeoulSearch] = useState<string>('');
  const [selectedSubRegionId, setSelectedSubRegionId] = useState<string | null>(
    null,
  );

  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  const [gpsStatus, setGpsStatus] = useState<
    'idle' | 'checking' | 'success' | 'failed'
  >('idle');
  const [weatherStatus, setWeatherStatus] = useState<
    'idle' | 'loading' | 'success' | 'error' | 'cancelled'
  >('idle');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [recommendNotice, setRecommendNotice] = useState<string | null>(null);

  const todayStr = useMemo(() => getKoreaTodayDateString(), []);
  const tomorrowStr = useMemo(() => addDaysToDateString(todayStr, 1), [todayStr]);
  const dayAfterStr = useMemo(() => addDaysToDateString(todayStr, 2), [todayStr]);
  const maxDateStr = useMemo(() => addDaysToDateString(todayStr, 15), [todayStr]);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const gpsRequestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      gpsRequestIdRef.current += 1;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const resetWeatherResult = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setWeather(null);
    setWeatherError(null);
    setWeatherStatus('idle');
    setRecommendNotice(null);
  }, []);

  const handleRequestCurrentPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsStatus('failed');
      return;
    }

    const requestId = ++gpsRequestIdRef.current;
    setGpsStatus('checking');
    setRecommendNotice(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (gpsRequestIdRef.current !== requestId) {
          return;
        }
        const { latitude, longitude } = position.coords;
        setGpsStatus('success');
        setSelectedCity(null);
        setSelectedSubRegionId(null);
        setSelectedLocation({
          label: '현재 내 위치',
          latitude,
          longitude,
          source: 'gps',
        });
        resetWeatherResult();
      },
      () => {
        if (gpsRequestIdRef.current !== requestId) {
          return;
        }
        setGpsStatus('failed');
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 0,
      },
    );
  }, [resetWeatherResult]);

  const handleCancelPosition = () => {
    gpsRequestIdRef.current += 1;
    setGpsStatus('idle');
  };

  const handleSelectCity = (city: CityOption) => {
    gpsRequestIdRef.current += 1;
    if (gpsStatus === 'checking') {
      setGpsStatus('idle');
    }
    setSelectedCity(city);
    setSelectedSubRegionId(null);
    setSeoulSearch('');
    setRecommendNotice(null);
    if (city.id === 'seoul' && city.districts && city.districts.length > 0) {
      setSelectedSeoulDistrict(city.districts[0]);
    }
  };

  const handleSelectSubRegion = (city: CityOption, subRegion: SubRegion) => {
    gpsRequestIdRef.current += 1;
    if (gpsStatus === 'checking') {
      setGpsStatus('idle');
    }
    setSelectedSubRegionId(subRegion.id);

    const fullLabel = subRegion.district
      ? `${city.name} ${subRegion.district} ${subRegion.name}`
      : `${city.name} ${subRegion.name}`;

    setSelectedLocation({
      label: fullLabel,
      latitude: subRegion.latitude,
      longitude: subRegion.longitude,
      source: 'manual',
    });
    resetWeatherResult();
  };

  const handleChangeDate = (newDate: string) => {
    if (!newDate) {
      return;
    }
    setSelectedDate(newDate);
    resetWeatherResult();
  };

  const handleFetchWeather = useCallback(async () => {
    if (!selectedLocation) {
      setRecommendNotice('먼저 지역이나 현재 위치를 선택해 주세요.');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setWeatherStatus('loading');
    setWeatherError(null);
    setRecommendNotice(null);

    try {
      const result = await fetchOpenMeteoWeather(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedDate,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        setWeather(result);
        setWeatherStatus('success');
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message =
        err instanceof Error && err.message
          ? err.message
          : '날씨 정보를 가져오지 못했어요. 다시 시도해 주세요.';
      setWeatherError(message);
      setWeatherStatus('error');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [selectedLocation, selectedDate]);

  const handleStopFetch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setWeather(null);
    setWeatherError(null);
    setWeatherStatus('cancelled');
  };

  const visibleSubRegions = useMemo(() => {
    if (!selectedCity) {
      return [];
    }
    if (selectedCity.id !== 'seoul') {
      return selectedCity.subRegions;
    }

    const keyword = seoulSearch.trim();
    if (keyword.length > 0) {
      return selectedCity.subRegions.filter(
        (item) =>
          item.name.includes(keyword) ||
          (item.district && item.district.includes(keyword)),
      );
    }

    return selectedCity.subRegions.filter(
      (item) => item.district === selectedSeoulDistrict,
    );
  }, [selectedCity, selectedSeoulDistrict, seoulSearch]);

  const handleRecommendClick = () => {
    if (!selectedLocation || weatherStatus !== 'success' || !weather) {
      setRecommendNotice('먼저 날짜와 지역을 선택한 뒤 날씨 조회하기를 눌러 주세요.');
      return;
    }
    setRecommendNotice(null);
    onRecommend(selectedLocation, weather);
  };

  const isWeatherLoading = weatherStatus === 'loading';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-blue-800">2단계 · 오늘 날씨</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl text-balance">
          날짜와 지역을 고른 뒤 날씨를 조회해 주세요
        </h1>
      </div>

      {/* 1. 날짜 선택 (오늘이 기본값) */}
      <section
        aria-labelledby="date-heading"
        className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="date-heading" className="text-xl font-bold text-zinc-900">
            날짜 선택
          </h2>
          <span className="text-sm font-semibold text-blue-800">
            {formatKoreanDateLabel(selectedDate, todayStr)}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 gap-2.5 sm:flex sm:shrink-0">
            {[
              { label: '오늘', value: todayStr },
              { label: '내일', value: tomorrowStr },
              { label: '모레', value: dayAfterStr },
            ].map((preset) => {
              const isPresetActive = selectedDate === preset.value;
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isWeatherLoading}
                  aria-pressed={isPresetActive}
                  onClick={() => handleChangeDate(preset.value)}
                  className={`min-h-[50px] rounded-2xl px-5 py-2.5 text-base font-bold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                    isPresetActive
                      ? 'border-[3px] border-blue-800 bg-blue-50 text-blue-950 shadow-sm'
                      : 'border border-zinc-200 bg-stone-50 text-zinc-800 hover:border-zinc-400 hover:bg-white'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1">
            <Calendar className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-500" />
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              max={maxDateStr}
              disabled={isWeatherLoading}
              onChange={(e) => handleChangeDate(e.target.value)}
              aria-label="원하는 날짜 직접 선택"
              className="min-h-[50px] w-full rounded-2xl border border-zinc-300 bg-stone-50 py-2.5 pr-4 pl-12 text-base font-bold text-zinc-900 focus:border-blue-800 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
        <p className="mt-2.5 text-sm text-zinc-500">
          기본은 오늘 날씨예요. 원하시면 오늘부터 15일 뒤까지 날짜를 바꿀 수 있어요.
        </p>
      </section>

      {/* 위치 찾기 실패 안내 */}
      {gpsStatus === 'failed' && !selectedLocation && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 shrink-0 text-amber-800" />
            <p className="text-lg font-bold text-amber-950">
              위치를 찾지 못했어요. 지역을 골라 주세요
            </p>
          </div>
          <button
            type="button"
            disabled={isWeatherLoading}
            onClick={handleRequestCurrentPosition}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-100 whitespace-nowrap shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Navigation className="h-4 w-4" />
            <span>다시 위치 찾기</span>
          </button>
        </div>
      )}

      {gpsStatus === 'checking' && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-base font-semibold text-zinc-700"
        >
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-800" />
            <span>현재 위치를 확인하고 있어요…</span>
          </div>
          <button
            type="button"
            onClick={handleCancelPosition}
            className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-xl border border-zinc-300 bg-stone-50 px-3.5 py-1.5 text-sm font-bold text-zinc-700 hover:bg-stone-100 whitespace-nowrap shrink-0"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>찾기 중지</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* 2. 왼쪽 영역: 지역 또는 현재 위치 선택 */}
        <section
          aria-labelledby="region-heading"
          className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              id="region-heading"
              className="text-xl font-bold text-zinc-900"
            >
              지역을 골라 주세요
            </h2>

            {gpsStatus === 'checking' ? (
              <button
                type="button"
                onClick={handleCancelPosition}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-sm font-bold text-rose-800 transition-colors hover:bg-rose-100 whitespace-nowrap shrink-0"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>위치 찾기 중지</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isWeatherLoading}
                onClick={handleRequestCurrentPosition}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedLocation?.source === 'gps'
                    ? 'border-[2px] border-blue-800 bg-blue-50 text-blue-950'
                    : 'border border-zinc-200 bg-stone-50 text-zinc-700 hover:border-zinc-400 hover:bg-white'
                }`}
              >
                <Navigation className="h-4 w-4 text-blue-800" />
                <span>현재 위치 선택</span>
              </button>
            )}
          </div>

          {/* 9개 시/도 버튼 */}
          <div className="grid grid-cols-3 gap-3">
            {CITIES.map((city) => {
              const isSelected = selectedCity?.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  disabled={isWeatherLoading}
                  aria-pressed={isSelected}
                  onClick={() => handleSelectCity(city)}
                  className={`min-h-[54px] rounded-2xl px-4 py-3 text-lg font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? 'border-[3px] border-blue-800 bg-blue-50 text-blue-950 shadow-sm'
                      : 'border border-zinc-200 bg-stone-50 text-zinc-800 hover:border-zinc-400 hover:bg-white'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>

          {/* 세부 지역 (서울: 동 단위 / 경기: 시·군 단위 / 그 외: 군·구 단위) */}
          {selectedCity && (
            <div className="space-y-4 border-t border-zinc-200 pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-bold text-zinc-900">
                  {selectedCity.name} ·{' '}
                  {selectedCity.subUnitLabel === '동'
                    ? '동 단위 선택'
                    : selectedCity.subUnitLabel === '시/군'
                      ? '시·군 단위 선택'
                      : '군·구 단위 선택'}
                </h3>
                <span className="text-sm text-zinc-500">
                  지역을 고른 뒤 &lsquo;날씨 조회하기&rsquo;를 눌러 주세요
                </span>
              </div>

              {/* 서울일 때: 동 검색 + 구 선택 */}
              {selectedCity.id === 'seoul' && selectedCity.districts && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="search"
                      value={seoulSearch}
                      disabled={isWeatherLoading}
                      onChange={(e) => setSeoulSearch(e.target.value)}
                      placeholder="동 또는 구 이름으로 찾기 (예: 역삼동, 명동, 잠실동)"
                      aria-label="서울 동 또는 구 이름 검색"
                      className="min-h-[52px] w-full rounded-2xl border border-zinc-300 bg-stone-50 py-3 pr-4 pl-12 text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-blue-800 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  {seoulSearch.trim().length === 0 && (
                    <div>
                      <p className="mb-2.5 text-sm font-semibold text-zinc-600">
                        먼저 구를 선택하세요
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {selectedCity.districts.map((district) => {
                          const isDistSelected =
                            selectedSeoulDistrict === district;
                          return (
                            <button
                              key={district}
                              type="button"
                              disabled={isWeatherLoading}
                              aria-pressed={isDistSelected}
                              onClick={() => setSelectedSeoulDistrict(district)}
                              className={`min-h-[44px] rounded-xl px-2.5 py-2 text-[15px] font-bold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                                isDistSelected
                                  ? 'bg-zinc-900 text-white'
                                  : 'bg-stone-100 text-zinc-700 hover:bg-stone-200'
                              }`}
                            >
                              {district}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 동, 시/군 또는 군/구 목록 */}
              <div>
                {selectedCity.id === 'seoul' && (
                  <p className="mb-2.5 text-sm font-semibold text-zinc-600">
                    {seoulSearch.trim().length > 0
                      ? `'${seoulSearch.trim()}' 검색 결과`
                      : `${selectedSeoulDistrict}의 동 선택`}
                  </p>
                )}

                {visibleSubRegions.length === 0 ? (
                  <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-base font-medium text-zinc-500">
                    일치하는 동 이름이 없어요. 구 이름으로 먼저 선택해 보세요.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {visibleSubRegions.map((sub) => {
                      const isSubSelected = selectedSubRegionId === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          disabled={isWeatherLoading}
                          aria-pressed={isSubSelected}
                          onClick={() =>
                            handleSelectSubRegion(selectedCity, sub)
                          }
                          className={`min-h-[52px] rounded-2xl px-3.5 py-2.5 text-base font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                            isSubSelected
                              ? 'border-[3px] border-blue-800 bg-blue-50 text-blue-950 shadow-sm'
                              : 'border border-zinc-200 bg-stone-50 text-zinc-800 hover:border-zinc-400 hover:bg-white'
                          }`}
                        >
                          {seoulSearch.trim().length > 0 && sub.district
                            ? `${sub.district} ${sub.name}`
                            : sub.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 3. 오른쪽 영역: 날씨 조회 버튼 + 조회 중지 + 결과 카드 */}
        <section
          aria-labelledby="weather-result-heading"
          className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="weather-result-heading"
              className="text-xl font-bold text-zinc-900"
            >
              {selectedDate === todayStr
                ? '오늘 날씨'
                : `${formatShortKoreanDate(selectedDate)} 날씨`}
            </h2>
            {selectedLocation && (
              <span className="text-sm font-semibold text-blue-800">
                {selectedLocation.label}
              </span>
            )}
          </div>

          {/* 선택한 날짜·지역 요약 및 조회 / 중지 버튼 */}
          <div className="space-y-3 rounded-2xl border border-zinc-200 bg-stone-50 p-4">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-zinc-600">
                날짜:{' '}
                <span className="font-bold text-zinc-900">
                  {formatKoreanDateLabel(selectedDate, todayStr)}
                </span>
              </p>
              <p className="font-semibold text-zinc-600">
                위치:{' '}
                <span
                  className={
                    selectedLocation
                      ? 'font-bold text-blue-900'
                      : 'font-semibold text-zinc-500'
                  }
                >
                  {selectedLocation
                    ? selectedLocation.label
                    : '아직 선택되지 않았어요'}
                </span>
              </p>
            </div>

            {isWeatherLoading ? (
              <button
                type="button"
                onClick={handleStopFetch}
                className="flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-rose-600 bg-rose-50 px-5 py-3 text-lg font-bold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 active:scale-[0.99]"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>조회 중지</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!selectedLocation}
                onClick={() => void handleFetchWeather()}
                className={`flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-lg font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
                  selectedLocation
                    ? 'cursor-pointer bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 active:scale-[0.99]'
                    : 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                }`}
              >
                <CloudSun className="h-5 w-5 shrink-0" />
                <span>날씨 조회하기</span>
              </button>
            )}
          </div>

          {weatherStatus === 'idle' && (
            <div className="rounded-2xl bg-stone-50 px-5 py-8 text-center">
              <p className="text-base font-semibold text-zinc-700">
                {selectedLocation
                  ? "위 '날씨 조회하기' 버튼을 누르면 날씨를 가져와요."
                  : '먼저 날짜와 지역(또는 현재 위치)을 선택해 주세요.'}
              </p>
            </div>
          )}

          {weatherStatus === 'cancelled' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-7 text-center"
            >
              <p className="text-base font-bold text-amber-950">
                날씨 조회를 중지했어요.
              </p>
              <p className="mt-1 text-sm text-amber-900">
                다시 확인하려면 &lsquo;날씨 조회하기&rsquo; 버튼을 눌러 주세요.
              </p>
            </div>
          )}

          {weatherStatus === 'loading' && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-stone-50 px-5 py-10 text-center"
            >
              <Loader2 className="h-9 w-9 animate-spin text-blue-800" />
              <p className="text-xl font-bold text-zinc-800">
                날씨를 확인하는 중…
              </p>
              <p className="text-sm text-zinc-500">
                원하시면 위의 &lsquo;조회 중지&rsquo; 버튼으로 멈출 수 있어요.
              </p>
            </div>
          )}

          {weatherStatus === 'error' && (
            <div
              role="alert"
              className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center"
            >
              <p className="text-base font-bold text-rose-900">
                {weatherError}
              </p>
              {selectedLocation && (
                <button
                  type="button"
                  onClick={() => void handleFetchWeather()}
                  className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl bg-rose-900 px-5 py-2.5 text-base font-bold text-white hover:bg-rose-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>다시 조회하기</span>
                </button>
              )}
            </div>
          )}

          {weatherStatus === 'success' && weather && (
            <div className="space-y-6">
              {/* 요청된 큰 날씨 요약 문장 */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                <p className="text-2xl leading-relaxed font-extrabold text-zinc-900 tabular-nums sm:text-[26px]">
                  {weather.isToday ? (
                    <>
                      {weather.weatherEmoji} 지금 {weather.temperature}℃ (체감{' '}
                      {weather.apparentTemperature}℃) · {weather.weatherLabel} /
                      오늘 최저 {weather.minTemp}℃ · 최고 {weather.maxTemp}℃ · 비
                      올 확률 {weather.precipitationProbability}%
                    </>
                  ) : (
                    <>
                      {weather.weatherEmoji}{' '}
                      {formatShortKoreanDate(weather.date)} 낮 예상{' '}
                      {weather.temperature}℃ (체감 {weather.apparentTemperature}
                      ℃) · {weather.weatherLabel} / 최저 {weather.minTemp}℃ ·
                      최고 {weather.maxTemp}℃ · 비 올 확률{' '}
                      {weather.precipitationProbability}%
                    </>
                  )}
                </p>
              </div>

              {/* 세부 지표 */}
              <dl className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-left tabular-nums">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-zinc-500">
                    {weather.isToday
                      ? '지금 기온 / 체감'
                      : '낮 예상 기온 / 체감'}
                  </dt>
                  <dd className="text-xl font-bold text-zinc-900">
                    {weather.temperature}℃{' '}
                    <span className="text-base font-semibold text-zinc-500">
                      (체감 {weather.apparentTemperature}℃)
                    </span>
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-sm font-medium text-zinc-500">
                    날씨 상태
                  </dt>
                  <dd className="text-xl font-bold text-zinc-900">
                    {weather.weatherEmoji} {weather.weatherLabel}
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-sm font-medium text-zinc-500">
                    {weather.isToday ? '오늘 최저 · 최고' : '예상 최저 · 최고'}
                  </dt>
                  <dd className="text-xl font-bold text-zinc-900">
                    {weather.minTemp}℃ / {weather.maxTemp}℃
                  </dd>
                </div>

                <div className="space-y-1">
                  <dt className="text-sm font-medium text-zinc-500">
                    비 올 확률
                  </dt>
                  <dd className="text-xl font-bold text-zinc-900">
                    {weather.precipitationProbability}%
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>
      </div>

      {/* 하단 버튼 영역: 이전 + 🤖 옷차림 추천받기 */}
      <div className="space-y-3 border-t border-zinc-200 pt-6">
        {recommendNotice && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-base font-semibold text-blue-900"
          >
            {recommendNotice}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <button
            type="button"
            disabled={isWeatherLoading}
            onClick={onBack}
            className="flex min-h-[60px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-300 bg-white px-6 py-4 text-xl font-bold text-zinc-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-4"
          >
            <ArrowLeft className="h-6 w-6 shrink-0" />
            <span>이전</span>
          </button>

          <button
            type="button"
            disabled={isWeatherLoading}
            onClick={handleRecommendClick}
            className={`flex min-h-[60px] items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xl font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 sm:col-span-8 ${
              isWeatherLoading
                ? 'cursor-not-allowed bg-zinc-200 text-zinc-500'
                : 'cursor-pointer bg-blue-900 text-white shadow-md hover:bg-blue-800 active:scale-[0.99]'
            }`}
          >
            <span>🤖 옷차림 추천받기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
