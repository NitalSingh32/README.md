import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Compass, 
  HeartHandshake, 
  Check, 
  Clock, 
  Luggage, 
  Utensils, 
  Camera, 
  Mountain, 
  Landmark, 
  Beer, 
  ShoppingBag, 
  Feather, 
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TripPreferences, TravelerType, BudgetTier, TravelPace } from '../types.ts';

interface TripPlannerWizardProps {
  onGenerate: (prefs: TripPreferences) => Promise<void>;
  isLoading: boolean;
  onCancel?: () => void;
  hasExistingTrips?: boolean;
}

const POPULAR_DESTINATIONS = [
  { name: 'Tokyo, Japan', label: 'Tokyo', flag: '🇯🇵', tag: 'Culture & Modernity' },
  { name: 'Paris, France', label: 'Paris', flag: '🇫🇷', tag: 'Art & Romance' },
  { name: 'Rome, Italy', label: 'Rome', flag: '🇮🇹', tag: 'Ancient Wonders' },
  { name: 'Kyoto, Japan', label: 'Kyoto', flag: '🇯🇵', tag: 'Temples & Zen' },
  { name: 'Barcelona, Spain', label: 'Barcelona', flag: '🇪🇸', tag: 'Architecture & Beach' },
  { name: 'Bali, Indonesia', label: 'Bali', flag: '🇮🇩', tag: 'Tropical Serenity' },
  { name: 'New York City, USA', label: 'New York', flag: '🇺🇸', tag: 'Urban Energy' },
  { name: 'Banff & Rockies, Canada', label: 'Banff', flag: '🇨🇦', tag: 'Alpine Wilderness' },
];

const INTEREST_OPTIONS = [
  { id: 'History & Heritage', label: 'History & Heritage', icon: Landmark, desc: 'Ancient sites & monuments' },
  { id: 'Food & Culinary', label: 'Food & Culinary', icon: Utensils, desc: 'Street food to bistros' },
  { id: 'Nature & Outdoors', label: 'Nature & Outdoors', icon: Mountain, desc: 'Parks, hikes, landscapes' },
  { id: 'Art & Museums', label: 'Art & Museums', icon: Camera, desc: 'Galleries & exhibitions' },
  { id: 'Nightlife & Drinks', label: 'Nightlife & Drinks', icon: Beer, desc: 'Cocktail bars & music' },
  { id: 'Shopping & Bazaars', label: 'Shopping & Bazaars', icon: ShoppingBag, desc: 'Markets & boutiques' },
  { id: 'Photography Spots', label: 'Photography Spots', icon: Camera, desc: 'Golden hour scenic views' },
  { id: 'Wellness & Spas', label: 'Wellness & Spas', icon: Feather, desc: 'Thermal baths & peaceful retreats' },
  { id: 'Hidden Gems', label: 'Hidden Gems', icon: Sparkles, desc: 'Off-the-beaten-path secrets' },
];

export const TripPlannerWizard: React.FC<TripPlannerWizardProps> = ({
  onGenerate,
  isLoading,
  onCancel,
  hasExistingTrips,
}) => {
  // Today's date helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekEndDate = new Date();
  nextWeekEndDate.setDate(nextWeekEndDate.getDate() + 11);

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(nextWeekDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(nextWeekEndDate.toISOString().split('T')[0]);
  const [travelerType, setTravelerType] = useState<TravelerType>('couple');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('moderate');
  const [pace, setPace] = useState<TravelPace>('balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'History & Heritage',
    'Food & Culinary',
    'Photography Spots',
  ]);
  const [dietary, setDietary] = useState('None');
  const [specialRequests, setSpecialRequests] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calculate day count
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const calculatedDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((i) => i !== interest));
      }
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setValidationError('Please specify your desired travel destination.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setValidationError('End date must be on or after start date.');
      return;
    }
    if (calculatedDays > 14) {
      setValidationError('Please choose a trip duration of up to 14 days for optimal AI detail.');
      return;
    }

    setValidationError('');

    try {
      await onGenerate({
        destination: destination.trim(),
        startDate,
        endDate,
        travelerType,
        budgetTier,
        pace,
        interests: selectedInterests,
        dietaryRestrictions: dietary !== 'None' ? dietary : undefined,
        specialRequests: specialRequests.trim() || undefined,
      });

      // Fire festive celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0284c7', '#0d9488', '#10b981', '#f59e0b'],
      });
    } catch (err) {
      // Error handled by parent
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Luggage className="w-56 h-56" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Itinerary Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit']">
            Design Your Personalized Journey
          </h2>
          <p className="mt-2 text-sky-100 text-sm sm:text-base leading-relaxed">
            Tell us where you want to go, your travel pace, budget, and favorite activities. TravelMate AI crafts a tailored, day-by-day plan with dining, budgets, and insider secrets.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        {validationError && (
          <div className="flex items-center space-x-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: Destination */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
              <span>Where are you traveling?</span>
            </label>
            <span className="text-xs text-slate-400">City, Country, or Region</span>
          </div>

          <div className="relative">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="e.g. Kyoto, Japan or Florence & Tuscany, Italy"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-base"
              disabled={isLoading}
            />
          </div>

          {/* Quick-pick popular chips */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-500 mb-2">Or choose from popular favorites:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => {
                    setDestination(dest.name);
                    if (validationError) setValidationError('');
                  }}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    destination === dest.name
                      ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{dest.flag}</span>
                  <span>{dest.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 2: Travel Dates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">2</span>
              <span>Travel Dates & Duration</span>
            </label>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
              {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'} ({calculatedDays - 1} Nights)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Departure / Start Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (new Date(endDate) < new Date(e.target.value)) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Return / End Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Travel Party & Budget Tier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traveler Type */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">3</span>
              <span>Who is traveling?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'solo', label: 'Solo Explorer', icon: '🎒' },
                { id: 'couple', label: 'Couple / Romance', icon: '🥂' },
                { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧' },
                { id: 'friends', label: 'Friends Group', icon: '🎉' },
                { id: 'business_leisure', label: 'Bleisure', icon: '💼' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTravelerType(item.id as TravelerType)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    travelerType === item.id
                      ? 'bg-sky-50/70 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Tier */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">4</span>
              <span>Budget Preference</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'budget', label: 'Budget ($)', note: 'Smart savings & local eats', badge: '$50-$80/day' },
                { id: 'moderate', label: 'Moderate ($$)', note: 'Boutiques & great dining', badge: '$120-$200/day' },
                { id: 'luxury', label: 'Luxury ($$$)', note: '4/5-star comfort & fine dining', badge: '$300-$500/day' },
                { id: 'ultra_luxury', label: 'Ultra ($$$$)', note: 'VIP access & premier stays', badge: '$600+/day' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudgetTier(tier.id as BudgetTier)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    budgetTier === tier.id
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{tier.label}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{tier.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{tier.note}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 4: Travel Pace */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">5</span>
            <span>Desired Travel Pace</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'relaxed', title: 'Relaxed & Unhurried', desc: '1-2 highlights a day, long cafe pauses, zero rushing' },
              { id: 'balanced', title: 'Balanced & Classic', desc: '3 key highlights with comfortable transit & scenic meals' },
              { id: 'packed', title: 'Fast-Paced & Packed', desc: 'Sunrise to twilight, maximizing sightseeing & adventures' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPace(item.id as TravelPace)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  pace === item.id
                    ? 'bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-500'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{item.title}</span>
                  {pace === item.id && <Check className="w-4 h-4 text-sky-600" />}
                </div>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 5: Interests & Vibe */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-800 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">6</span>
              <span>Interests & Activities (Select all that apply)</span>
            </label>
            <span className="text-xs text-slate-400">{selectedInterests.length} selected</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const Icon = interest.icon;
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-start space-x-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-50 border-sky-500 text-sky-950 font-medium'
                      : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-sky-200/70 text-sky-800' : 'bg-slate-200/60 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight">{interest.label}</p>
                    <p className="text-[10px] text-slate-400 truncate">{interest.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 6: Dietary & Special Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dietary Preference</label>
            <select
              value={dietary}
              onChange={(e) => setDietary(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="None">No Dietary Restrictions (Omnivore)</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Strict Vegan</option>
              <option value="Halal">Halal Friendly</option>
              <option value="Gluten-Free">Gluten-Free / Celiac</option>
              <option value="Pescatarian">Pescatarian (Seafood & Veg)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Special Requests & Notes (Optional)</label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g. Traveling with toddler, prefer no steep stairs, want sunrise views"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Submit Button & Loading State */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Generates day-by-day plans, attraction cards, dining spots & budget breakdown</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {onCancel && hasExistingTrips && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[200px] flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 hover:from-sky-700 hover:to-teal-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-600/25 transition-all transform active:scale-95 disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Itinerary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Personalized Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
