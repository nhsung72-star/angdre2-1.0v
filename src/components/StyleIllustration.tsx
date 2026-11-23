import type { OutfitStyleId } from '../types';

interface StyleIllustrationProps {
  styleId: OutfitStyleId;
  selected?: boolean;
}

export function StyleIllustration({
  styleId,
  selected = false,
}: StyleIllustrationProps) {
  const bgClass = selected ? 'bg-blue-100/70' : 'bg-stone-100';

  if (styleId === 'casual') {
    return (
      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors ${bgClass}`}
        aria-hidden="true"
      >
        {/* 편안한 캐주얼: 니트 스웨터 & 운동화 */}
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
          <path
            d="M20 16L11 23L15 32L20 29V48H44V29L49 32L53 23L44 16L38 19C35.5 20.5 28.5 20.5 26 19L20 16Z"
            fill="#6B9080"
            stroke="#2D4739"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M26 19C28.5 22 35.5 22 38 19"
            stroke="#EAF4F4"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect
            x="22"
            y="43"
            width="20"
            height="4"
            rx="1.5"
            fill="#4F7061"
          />
          <path
            d="M21 51H43L45 57H35L32 54L29 57H19L21 51Z"
            fill="#4A6FA5"
            stroke="#1E3A5F"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  if (styleId === 'neat') {
    return (
      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors ${bgClass}`}
        aria-hidden="true"
      >
        {/* 단정한 외출복: 셔츠 칼라 & 가디건/재킷 */}
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
          <path
            d="M20 14L11 22L15 33L20 30V51H44V30L49 33L53 22L44 14L37 16L32 25L27 16L20 14Z"
            fill="#3B5B8C"
            stroke="#1E3250"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M27 16L32 25L37 16"
            fill="#FFFFFF"
            stroke="#1E3250"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M26 14L32 21L38 14"
            stroke="#1E3250"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="32"
            y1="25"
            x2="32"
            y2="51"
            stroke="#1E3250"
            strokeWidth="2"
          />
          <circle cx="35.5" cy="33" r="1.4" fill="#E2E8F0" />
          <circle cx="35.5" cy="40" r="1.4" fill="#E2E8F0" />
          <circle cx="35.5" cy="47" r="1.4" fill="#E2E8F0" />
        </svg>
      </div>
    );
  }

  if (styleId === 'active') {
    return (
      <div
        className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors ${bgClass}`}
        aria-hidden="true"
      >
        {/* 활동적인 운동복: 집업 바람막이 & 러닝 */}
        <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
          <path
            d="M21 15L11 23L15 33L21 29V49H43V29L49 33L53 23L43 15L37 13H27L21 15Z"
            fill="#E07A5F"
            stroke="#7A3222"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <path
            d="M25 13H39V18H25V13Z"
            fill="#F2CC8F"
            stroke="#7A3222"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line
            x1="32"
            y1="18"
            x2="32"
            y2="49"
            stroke="#7A3222"
            strokeWidth="2.2"
          />
          <path
            d="M21 31H28M36 31H43"
            stroke="#F4F1DE"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M20 53H44L47 57H17L20 53Z"
            fill="#3D405B"
            stroke="#24263B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl transition-colors ${bgClass}`}
      aria-hidden="true"
    >
      {/* 차분한 클래식: 트렌치코트 & 머플러 */}
      <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
        <path
          d="M21 15L12 23L15 35L20 32L18 54H46L44 32L49 35L52 23L43 15L36 17L32 23L28 17L21 15Z"
          fill="#C9AE8B"
          stroke="#5C4730"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M25 15L32 25L39 15"
          fill="#8C3B3B"
          stroke="#4F1E1E"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M29 22V33"
          stroke="#8C3B3B"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <rect
          x="19.5"
          y="35"
          width="25"
          height="3.5"
          rx="1.5"
          fill="#9E8260"
          stroke="#5C4730"
          strokeWidth="1.6"
        />
        <circle cx="28" cy="44" r="1.4" fill="#5C4730" />
        <circle cx="36" cy="44" r="1.4" fill="#5C4730" />
        <circle cx="28" cy="49" r="1.4" fill="#5C4730" />
        <circle cx="36" cy="49" r="1.4" fill="#5C4730" />
      </svg>
    </div>
  );
}
