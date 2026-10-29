export type TravelerType = 'solo' | 'couple' | 'family' | 'friends' | 'business_leisure';
export type BudgetTier = 'budget' | 'moderate' | 'luxury' | 'ultra_luxury';
export type TravelPace = 'relaxed' | 'balanced' | 'packed';

export interface TripPreferences {
  destination: string;
  startDate: string;
  endDate: string;
  travelerType: TravelerType;
  budgetTier: BudgetTier;
  approximateBudget?: number;
  pace: TravelPace;
  interests: string[];
  dietaryRestrictions?: string;
  accommodationType?: string;
  specialRequests?: string;
}

export interface Activity {
  id: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  time: string;
  title: string;
  location: string;
  description: string;
  duration: string;
  estimatedCost: number;
  costNote?: string;
  category: 'sightseeing' | 'food' | 'culture' | 'adventure' | 'nature' | 'relaxation' | 'nightlife' | 'transit';
  insiderTip?: string;
  bookingRequired?: boolean;
}

export interface MealRecommendation {
  restaurantName: string;
  cuisine: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  estimatedCost: number;
  highlightDish: string;
  neighborhood: string;
  note?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  theme: string;
  summary: string;
  activities: Activity[];
  meals: {
    breakfast?: MealRecommendation;
    lunch?: MealRecommendation;
    dinner?: MealRecommendation;
  };
  dayBudgetEstimate: number;
  transitTips: string;
}

export interface AttractionItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  recommendedDuration: string;
  estimatedCost: number;
  bestTimeToVisit: string;
  insiderTip: string;
}

export interface DiningItem {
  id: string;
  name: string;
  cuisine: string;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  avgCostPerPerson: number;
  neighborhood: string;
  specialty: string;
  reservationRecommended: boolean;
  atmosphere: string;
}

export interface BudgetBreakdown {
  currency: string;
  currencySymbol: string;
  totalEstimated: number;
  breakdown: {
    accommodation: number;
    foodAndDining: number;
    activitiesAndTickets: number;
    localTransportation: number;
    emergencyAndMisc: number;
  };
  moneySavingTips: string[];
}

export interface PackingItem {
  id: string;
  item: string;
  packed: boolean;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface WeatherAndPacking {
  expectedWeather: string;
  averageTemp: string;
  seasonAdvice: string;
  packingChecklist: PackingCategory[];
}

export interface LocalTips {
  tippingCulture: string;
  gettingAround: string;
  localEtiquette: string[];
  safetyNotes: string;
  emergencyNumbers: string;
  usefulPhrases: { phrase: string; translation: string; pronunciation?: string }[];
}

export interface ExpenseRecord {
  id: string;
  dayNumber: number;
  category: 'accommodation' | 'food' | 'activity' | 'transit' | 'other';
  title: string;
  amount: number;
  date: string;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  travelerType: TravelerType;
  budgetTier: BudgetTier;
  pace: TravelPace;
  interests: string[];
  overview: string;
  highlights: string[];
  budget: BudgetBreakdown;
  days: DayPlan[];
  attractions: AttractionItem[];
  dining: DiningItem[];
  weatherAndPacking: WeatherAndPacking;
  localTips: LocalTips;
  expenses?: ExpenseRecord[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}
