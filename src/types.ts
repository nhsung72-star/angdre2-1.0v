export type AgeGroup = '20대' | '30대' | '40대' | '50대' | '60대' | '70대 이상';

export type Gender = '여성' | '남성' | '선택 안 함';

export type OutfitStyleId = 'casual' | 'neat' | 'active' | 'classic';

export interface OutfitStyleOption {
  id: OutfitStyleId;
  name: string;
  description: string;
}

export interface UserProfile {
  ageGroup: AgeGroup | null;
  gender: Gender | null;
  style: OutfitStyleId | null;
}

export type CityId =
  | 'seoul'
  | 'gyeonggi'
  | 'suwon'
  | 'incheon'
  | 'daejeon'
  | 'daegu'
  | 'gwangju'
  | 'busan'
  | 'jeju';

export interface SubRegion {
  id: string;
  name: string;
  district?: string;
  latitude: number;
  longitude: number;
}

export interface CityOption {
  id: CityId;
  name: string;
  subUnitLabel: '동' | '군/구' | '시/군';
  districts?: string[];
  subRegions: SubRegion[];
}

export interface SelectedLocation {
  label: string;
  latitude: number;
  longitude: number;
  source: 'gps' | 'manual';
}

export interface WeatherData {
  date: string;
  isToday: boolean;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  weatherLabel: string;
  weatherEmoji: string;
  minTemp: number;
  maxTemp: number;
  precipitationProbability: number;
}

export type OuterwearKind =
  | 'none'
  | 'cardigan'
  | 'jacket'
  | 'blazer'
  | 'trench'
  | 'coat'
  | 'padding'
  | 'windbreaker';

export type TopKind = 'tshirt' | 'knit' | 'shirt' | 'hoodie' | 'blouse';

export type BottomKind = 'slacks' | 'jeans' | 'chinos' | 'jogger' | 'skirt';

export type ShoesKind = 'sneakers' | 'loafers' | 'boots' | 'running';

export type AccessoryKind =
  | 'none'
  | 'umbrella'
  | 'scarf'
  | 'cap'
  | 'bag'
  | 'sunglasses';

export type WeatherMood =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'rainy'
  | 'snowy';

export interface OutfitIllustrationSpec {
  outerwearKind: OuterwearKind;
  outerwearColor: string;
  topKind: TopKind;
  topColor: string;
  bottomKind: BottomKind;
  bottomColor: string;
  shoesKind: ShoesKind;
  shoesColor: string;
  accessoryKind: AccessoryKind;
  accessoryColor: string;
  mood: WeatherMood;
}

export interface OutfitRecommendation {
  outerwear: string;
  top: string;
  bottom: string;
  shoes: string;
  accessories: string;
  reason: string;
  illustration: OutfitIllustrationSpec;
}

