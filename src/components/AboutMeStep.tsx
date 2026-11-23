import { AlertCircle, ArrowRight } from 'lucide-react';
import { AGE_GROUPS, GENDERS, OUTFIT_STYLES } from '../data/styles';
import type { AgeGroup, Gender, OutfitStyleId, UserProfile } from '../types';
import { StyleIllustration } from './StyleIllustration';

interface AboutMeStepProps {
  profile: UserProfile;
  onChangeAgeGroup: (ageGroup: AgeGroup) => void;
  onChangeGender: (gender: Gender) => void;
  onChangeStyle: (style: OutfitStyleId) => void;
  onNext: () => void;
}

function getMissingPrompt(profile: UserProfile): string | null {
  if (!profile.ageGroup) {
    return '연령대를 골라 주세요';
  }
  if (!profile.gender) {
    return '성별을 골라 주세요';
  }
  if (!profile.style) {
    return '선호하는 옷 스타일을 골라 주세요';
  }
  return null;
}

export function AboutMeStep({
  profile,
  onChangeAgeGroup,
  onChangeGender,
  onChangeStyle,
  onNext,
}: AboutMeStepProps) {
  const missingPrompt = getMissingPrompt(profile);
  const isComplete = missingPrompt === null;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-blue-800">1단계 · 나에 대해</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl text-balance">
          나에게 꼭 맞는 옷차림을 위해 알려 주세요
        </h1>
        <p className="text-base text-zinc-600 sm:text-lg">
          연령대, 성별, 선호하는 옷 스타일을 하나씩 선택해 주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* 왼쪽 영역: 연령대 + 성별 */}
        <div className="space-y-8 lg:col-span-5">
          {/* 연령대 */}
          <section
            aria-labelledby="age-group-heading"
            className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2
                id="age-group-heading"
                className="text-xl font-bold text-zinc-900"
              >
                연령대
              </h2>
              <span className="text-sm font-medium text-zinc-500">
                1개 선택
              </span>
            </div>

            <div
              role="radiogroup"
              aria-labelledby="age-group-heading"
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2"
            >
              {AGE_GROUPS.map((age) => {
                const isSelected = profile.ageGroup === age;
                return (
                  <button
                    key={age}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onChangeAgeGroup(age)}
                    className={`min-h-[56px] rounded-2xl px-4 py-3 text-lg font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.98] ${
                      isSelected
                        ? 'border-[3px] border-blue-800 bg-blue-50 text-blue-950 shadow-sm'
                        : 'border border-zinc-200 bg-stone-50 text-zinc-800 hover:border-zinc-400 hover:bg-white'
                    }`}
                  >
                    {age}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 성별 */}
          <section
            aria-labelledby="gender-heading"
            className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <h2
                id="gender-heading"
                className="text-xl font-bold text-zinc-900"
              >
                성별
              </h2>
              <span className="text-sm font-medium text-zinc-500">
                1개 선택
              </span>
            </div>

            <div
              role="radiogroup"
              aria-labelledby="gender-heading"
              className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"
            >
              {GENDERS.map((gender) => {
                const isSelected = profile.gender === gender;
                return (
                  <button
                    key={gender}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onChangeGender(gender)}
                    className={`min-h-[56px] rounded-2xl px-4 py-3 text-lg font-bold whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 active:scale-[0.98] ${
                      isSelected
                        ? 'border-[3px] border-blue-800 bg-blue-50 text-blue-950 shadow-sm'
                        : 'border border-zinc-200 bg-stone-50 text-zinc-800 hover:border-zinc-400 hover:bg-white'
                    }`}
                  >
                    {gender}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* 오른쪽 영역: 선호하는 옷 스타일 4가지 카드 */}
        <section
          aria-labelledby="style-heading"
          className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6 lg:col-span-7"
        >
          <div className="mb-4 flex items-baseline justify-between gap-2">
            <h2
              id="style-heading"
              className="text-xl font-bold text-zinc-900"
            >
              선호하는 옷 스타일
            </h2>
            <span className="text-sm font-medium text-zinc-500">
              하나만 선택
            </span>
          </div>

          <div
            role="radiogroup"
            aria-labelledby="style-heading"
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
          >
            {OUTFIT_STYLES.map((style) => {
              const isSelected = profile.style === style.id;
              return (
                <label
                  key={style.id}
                  htmlFor={`style-${style.id}`}
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-800 active:scale-[0.99] ${
                    isSelected
                      ? 'border-[3px] border-blue-800 bg-blue-50/70 shadow-sm'
                      : 'border border-zinc-200 bg-stone-50/70 hover:border-zinc-400 hover:bg-white'
                  }`}
                >
                  <StyleIllustration
                    styleId={style.id}
                    selected={isSelected}
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-lg font-bold text-zinc-900">
                      {style.name}
                    </div>
                    <p className="text-[15px] leading-snug text-zinc-600">
                      {style.description}
                    </p>
                  </div>

                  <div className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center">
                    <input
                      id={`style-${style.id}`}
                      type="radio"
                      name="outfit-style"
                      value={style.id}
                      checked={isSelected}
                      onChange={() => onChangeStyle(style.id)}
                      className="h-6 w-6 cursor-pointer accent-blue-800"
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {/* 하단 안내 문구 및 다음 버튼 */}
      <div className="space-y-3 border-t border-zinc-200 pt-6">
        {missingPrompt && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-base font-semibold text-amber-900"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-700" />
            <span>{missingPrompt}</span>
          </div>
        )}

        <button
          type="button"
          disabled={!isComplete}
          onClick={onNext}
          className={`flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-xl font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 ${
            isComplete
              ? 'cursor-pointer bg-blue-900 text-white shadow-md hover:bg-blue-800 active:scale-[0.99]'
              : 'cursor-not-allowed bg-zinc-200 text-zinc-500'
          }`}
        >
          <span>다음</span>
          <ArrowRight className="h-6 w-6 shrink-0" />
        </button>
      </div>
    </div>
  );
}
