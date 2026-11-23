import type {
  AgeGroup,
  Gender,
  OutfitIllustrationSpec,
} from '../types';

interface OutfitLookbookSvgProps {
  spec: OutfitIllustrationSpec;
  gender: Gender;
  ageGroup: AgeGroup;
}

function safeHex(color: string | undefined, fallback: string): string {
  if (color && /^#[0-9a-fA-F]{6}$/.test(color.trim())) {
    return color.trim();
  }
  return fallback;
}

function darkenHex(hex: string, amount = 0.22): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function OutfitLookbookSvg({
  spec,
  gender,
  ageGroup,
}: OutfitLookbookSvgProps) {
  const outerColor = safeHex(spec.outerwearColor, '#3B5B8C');
  const outerShade = darkenHex(outerColor, 0.25);
  const topColor = safeHex(spec.topColor, '#F4F4F5');
  const topShade = darkenHex(topColor, 0.2);
  const bottomColor = safeHex(spec.bottomColor, '#334155');
  const bottomShade = darkenHex(bottomColor, 0.25);
  const shoesColor = safeHex(spec.shoesColor, '#E4E4E7');
  const shoesShade = darkenHex(shoesColor, 0.3);
  const accColor = safeHex(spec.accessoryColor, '#1E3A8A');
  const accShade = darkenHex(accColor, 0.25);

  const isSenior = ageGroup === '60대' || ageGroup === '70대 이상';
  const hairColor = isSenior ? '#6B7280' : '#27272A';
  const skinColor = '#F3D2B8';
  const skinShade = '#E2B89A';
  const isFeminine = gender === '여성';

  const skyBg =
    spec.mood === 'sunny'
      ? '#FFFBEB'
      : spec.mood === 'rainy'
        ? '#EFF6FF'
        : spec.mood === 'snowy'
          ? '#F0F9FF'
          : '#F8FAFC';

  const hasOuterwear = spec.outerwearKind !== 'none';

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[260px] overflow-hidden rounded-2xl border border-zinc-200 bg-stone-50">
        <svg
          viewBox="0 0 240 330"
          className="h-auto w-full"
          role="img"
          aria-label="추천 옷차림을 입은 모습 일러스트"
        >
          {/* 배경 날씨 분위기 */}
          <rect width="240" height="330" fill={skyBg} />
          <ellipse cx="120" cy="306" rx="70" ry="10" fill="#E4E4E7" />

          {spec.mood === 'sunny' && (
            <g>
              <circle cx="192" cy="46" r="18" fill="#FDE047" opacity="0.85" />
              <circle cx="192" cy="46" r="26" fill="#FEF08A" opacity="0.4" />
            </g>
          )}

          {(spec.mood === 'partly_cloudy' || spec.mood === 'cloudy') && (
            <g>
              {spec.mood === 'partly_cloudy' && (
                <circle cx="185" cy="46" r="14" fill="#FDE047" opacity="0.85" />
              )}
              <path
                d="M150 62H206C212 62 216 57 216 52C216 47 212 43 206 43C204 36 197 31 189 31C180 31 173 37 172 45C169 44 166 44 163 46C158 48 155 53 156 58C153 59 150 60 150 62Z"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
            </g>
          )}

          {spec.mood === 'rainy' && (
            <g stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" opacity="0.7">
              <line x1="40" y1="30" x2="34" y2="48" />
              <line x1="72" y1="45" x2="66" y2="63" />
              <line x1="176" y1="28" x2="170" y2="46" />
              <line x1="205" y1="52" x2="199" y2="70" />
              <line x1="52" y1="90" x2="46" y2="108" />
              <line x1="196" y1="100" x2="190" y2="118" />
            </g>
          )}

          {spec.mood === 'snowy' && (
            <g fill="#93C5FD" opacity="0.8">
              <circle cx="44" cy="40" r="3" />
              <circle cx="70" cy="68" r="2.5" />
              <circle cx="184" cy="36" r="3" />
              <circle cx="204" cy="72" r="2.5" />
              <circle cx="48" cy="116" r="2.5" />
              <circle cx="192" cy="124" r="3" />
            </g>
          )}

          {/* 우산 (소품이 우산일 때 캐릭터 뒤/옆에 자연스럽게 배치) */}
          {spec.accessoryKind === 'umbrella' && (
            <g>
              <path
                d="M170 72V225C170 232 178 232 178 225"
                fill="none"
                stroke="#3F3F46"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M122 86C128 52 212 52 218 86C202 80 186 80 170 86C154 80 138 80 122 86Z"
                fill={accColor}
                stroke={accShade}
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              <line
                x1="170"
                y1="56"
                x2="170"
                y2="62"
                stroke="#3F3F46"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* 머리 & 뒷머리 */}
          {isFeminine && (
            <path
              d="M94 52C94 34 146 34 146 52L149 84C144 88 138 88 134 84V66H106V84C102 88 96 88 91 84L94 52Z"
              fill={hairColor}
            />
          )}

          {/* 목 */}
          <rect x="112" y="76" width="16" height="20" rx="6" fill={skinShade} />

          {/* 얼굴 */}
          <circle cx="120" cy="58" r="21" fill={skinColor} />
          {/* 앞머리/헤어 */}
          {isFeminine ? (
            <path
              d="M98 54C99 37 141 37 142 54C135 45 127 44 120 46C113 44 105 45 98 54Z"
              fill={hairColor}
            />
          ) : (
            <path
              d="M98 54C98 35 142 35 142 54C138 45 129 43 120 44C110 43 102 46 98 54Z"
              fill={hairColor}
            />
          )}

          {/* 표정 (온화한 미소) */}
          <circle cx="113" cy="58" r="2" fill="#27272A" />
          <circle cx="127" cy="58" r="2" fill="#27272A" />
          <path
            d="M114 66C117 69 123 69 126 66"
            fill="none"
            stroke="#713F12"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* 선글라스 */}
          {spec.accessoryKind === 'sunglasses' && (
            <g>
              <rect
                x="104"
                y="53"
                width="14"
                height="9"
                rx="3"
                fill="#18181B"
                stroke={accColor}
                strokeWidth="1.5"
              />
              <rect
                x="122"
                y="53"
                width="14"
                height="9"
                rx="3"
                fill="#18181B"
                stroke={accColor}
                strokeWidth="1.5"
              />
              <line
                x1="118"
                y1="57"
                x2="122"
                y2="57"
                stroke={accColor}
                strokeWidth="1.8"
              />
            </g>
          )}

          {/* 모자 */}
          {spec.accessoryKind === 'cap' && (
            <g>
              <path
                d="M98 46C100 31 140 31 142 46Z"
                fill={accColor}
                stroke={accShade}
                strokeWidth="2"
              />
              <path
                d="M96 46H150C152 46 153 49 148 50H96Z"
                fill={accShade}
              />
            </g>
          )}

          {/* 팔 (피부/소매 아래 손) */}
          <circle cx="71" cy="184" r="6.5" fill={skinColor} />
          <circle cx="169" cy="184" r="6.5" fill={skinColor} />

          {/* 다리 / 발목 */}
          {spec.bottomKind === 'skirt' ? (
            <>
              <rect x="102" y="242" width="11" height="44" rx="5" fill={skinColor} />
              <rect x="127" y="242" width="11" height="44" rx="5" fill={skinColor} />
            </>
          ) : (
            <>
              <rect x="97" y="272" width="14" height="14" rx="4" fill={skinShade} />
              <rect x="129" y="272" width="14" height="14" rx="4" fill={skinShade} />
            </>
          )}

          {/* 하의 */}
          {spec.bottomKind === 'skirt' ? (
            <path
              d="M93 176H147L158 248H82L93 176Z"
              fill={bottomColor}
              stroke={bottomShade}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          ) : spec.bottomKind === 'jogger' ? (
            <g>
              <path
                d="M93 176H147L150 274H128L120 214L112 274H90L93 176Z"
                fill={bottomColor}
                stroke={bottomShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <rect x="89" y="268" width="24" height="7" rx="3" fill={bottomShade} />
              <rect x="127" y="268" width="24" height="7" rx="3" fill={bottomShade} />
            </g>
          ) : (
            <g>
              <path
                d="M93 176H147L146 276H126L120 212L114 276H94L93 176Z"
                fill={bottomColor}
                stroke={bottomShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {spec.bottomKind === 'slacks' && (
                <>
                  <line x1="104" y1="194" x2="104" y2="270" stroke={bottomShade} strokeWidth="1.2" opacity="0.55" />
                  <line x1="136" y1="194" x2="136" y2="270" stroke={bottomShade} strokeWidth="1.2" opacity="0.55" />
                </>
              )}
              {spec.bottomKind === 'jeans' && (
                <path d="M96 184H144" stroke={bottomShade} strokeWidth="1.6" strokeDasharray="3 2" />
              )}
            </g>
          )}

          {/* 신발 */}
          {spec.shoesKind === 'boots' ? (
            <g>
              <path
                d="M93 272H115V296H85C85 289 89 286 93 286V272Z"
                fill={shoesColor}
                stroke={shoesShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M125 272H147V286C151 286 155 289 155 296H125V272Z"
                fill={shoesColor}
                stroke={shoesShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          ) : (
            <g>
              <path
                d="M95 282H114V296H84C84 289 89 285 95 282Z"
                fill={shoesColor}
                stroke={shoesShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M126 282H145C151 285 156 289 156 296H126V282Z"
                fill={shoesColor}
                stroke={shoesShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {(spec.shoesKind === 'sneakers' || spec.shoesKind === 'running') && (
                <>
                  <rect x="84" y="293" width="30" height="4" rx="1.5" fill="#FFFFFF" />
                  <rect x="126" y="293" width="30" height="4" rx="1.5" fill="#FFFFFF" />
                </>
              )}
            </g>
          )}

          {/* 상의 */}
          {!hasOuterwear ? (
            /* 겉옷이 없을 때는 상의 소매까지 전체 렌더링 */
            <g>
              <path
                d="M93 93L64 115L66 178H82L87 126V180H153V126L158 178H174L176 115L147 93L131 90C124 96 116 96 109 90L93 93Z"
                fill={topColor}
                stroke={topShade}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {spec.topKind === 'shirt' && (
                <>
                  <path d="M107 90L120 105L133 90" fill="#FFFFFF" stroke={topShade} strokeWidth="1.6" />
                  <line x1="120" y1="105" x2="120" y2="178" stroke={topShade} strokeWidth="1.5" />
                </>
              )}
              {spec.topKind === 'hoodie' && (
                <>
                  <path d="M104 91C109 102 131 102 136 91" fill="none" stroke={topShade} strokeWidth="3" />
                  <rect x="103" y="142" width="34" height="24" rx="6" fill={topShade} opacity="0.25" />
                </>
              )}
            </g>
          ) : (
            /* 겉옷 안쪽에 보이는 상의 */
            <g>
              <rect
                x="96"
                y="91"
                width="48"
                height="88"
                fill={topColor}
                stroke={topShade}
                strokeWidth="1.5"
              />
              {spec.topKind === 'shirt' && (
                <path
                  d="M108 91L120 106L132 91"
                  fill="none"
                  stroke={topShade}
                  strokeWidth="1.8"
                />
              )}
            </g>
          )}

          {/* 겉옷 레이어 */}
          {hasOuterwear && (
            <g>
              {spec.outerwearKind === 'coat' || spec.outerwearKind === 'trench' ? (
                /* 롱 코트 / 트렌치코트 */
                <>
                  <path
                    d="M93 92L63 114L65 180H83L88 124L84 236H112V104L93 92Z"
                    fill={outerColor}
                    stroke={outerShade}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M147 92L177 114L175 180H157L152 124L156 236H128V104L147 92Z"
                    fill={outerColor}
                    stroke={outerShade}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* 라펠 */}
                  <path d="M104 92L112 118L98 118Z" fill={outerShade} opacity="0.55" />
                  <path d="M136 92L128 118L142 118Z" fill={outerShade} opacity="0.55" />
                  {spec.outerwearKind === 'trench' && (
                    <rect
                      x="86"
                      y="156"
                      width="68"
                      height="6"
                      rx="2"
                      fill={outerShade}
                    />
                  )}
                </>
              ) : spec.outerwearKind === 'padding' ? (
                /* 패딩 점퍼 */
                <>
                  <path
                    d="M92 91L61 114L64 179H84L88 126V182H152V126L156 179H176L179 114L148 91L132 88H108L92 91Z"
                    fill={outerColor}
                    stroke={outerShade}
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <line x1="120" y1="90" x2="120" y2="182" stroke={outerShade} strokeWidth="2.2" />
                  <line x1="89" y1="118" x2="151" y2="118" stroke={outerShade} strokeWidth="1.6" opacity="0.55" />
                  <line x1="88" y1="142" x2="152" y2="142" stroke={outerShade} strokeWidth="1.6" opacity="0.55" />
                  <line x1="88" y1="164" x2="152" y2="164" stroke={outerShade} strokeWidth="1.6" opacity="0.55" />
                </>
              ) : (
                /* 가디건 / 재킷 / 블레이저 / 바람막이 */
                <>
                  <path
                    d="M93 92L63 114L65 179H83L88 124V181H111V106L93 92Z"
                    fill={outerColor}
                    stroke={outerShade}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M147 92L177 114L175 179H157L152 124V181H129V106L147 92Z"
                    fill={outerColor}
                    stroke={outerShade}
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {spec.outerwearKind === 'blazer' && (
                    <>
                      <path d="M104 92L111 118L98 118Z" fill={outerShade} opacity="0.55" />
                      <path d="M136 92L129 118L142 118Z" fill={outerShade} opacity="0.55" />
                    </>
                  )}
                  {spec.outerwearKind === 'windbreaker' && (
                    <path
                      d="M64 134H85M155 134H176"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                  )}
                </>
              )}
            </g>
          )}

          {/* 목도리 / 스카프 */}
          {spec.accessoryKind === 'scarf' && (
            <g>
              <rect
                x="101"
                y="84"
                width="38"
                height="15"
                rx="7"
                fill={accColor}
                stroke={accShade}
                strokeWidth="1.8"
              />
              <path
                d="M122 96H136L134 138H120L122 96Z"
                fill={accColor}
                stroke={accShade}
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* 가방 */}
          {spec.accessoryKind === 'bag' && (
            <g>
              <path
                d="M150 95C162 120 166 152 162 182"
                fill="none"
                stroke={accShade}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect
                x="146"
                y="180"
                width="30"
                height="34"
                rx="5"
                fill={accColor}
                stroke={accShade}
                strokeWidth="2"
              />
              <path d="M146 191H176" stroke={accShade} strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
      <p className="mt-2.5 text-center text-sm font-semibold text-zinc-500">
        추천 옷차림 착용 이미지
      </p>
    </div>
  );
}
