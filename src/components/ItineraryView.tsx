import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles, 
  Wand2, 
  Share2, 
  Wallet, 
  Heart, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRightLeft, 
  Utensils, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  CloudSun, 
  CheckSquare, 
  Square, 
  Info, 
  ShieldCheck, 
  Volume2, 
  Coffee, 
  ChevronRight,
  Landmark,
  Luggage,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Itinerary, Activity, DayPlan, PackingCategory, AttractionItem, DiningItem } from '../types.ts';
import { formatCurrency } from '../utils/itineraryUtils.ts';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onUpdateItinerary: (updated: Itinerary) => void;
  onOpenRefine: () => void;
  onOpenExpenseTracker: () => void;
  onOpenExport: () => void;
  onOpenConcierge: () => void;
  onOpenAddActivity: (dayNumber: number) => void;
  onOpenEditActivity: (dayNumber: number, activity: Activity) => void;
  onOpenSwapActivity: (dayNumber: number, currentTheme: string, activity: Activity) => void;
  onDeleteActivity: (dayNumber: number, activityId: string) => void;
  onToggleFavorite: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  itinerary,
  onUpdateItinerary,
  onOpenRefine,
  onOpenExpenseTracker,
  onOpenExport,
  onOpenConcierge,
  onOpenAddActivity,
  onOpenEditActivity,
  onOpenSwapActivity,
  onDeleteActivity,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'days' | 'attractions' | 'dining' | 'budget' | 'packing' | 'guide'>('days');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'all'>('all');

  // Interactive toggle for packing list
  const handleTogglePackingItem = (categoryIndex: number, itemId: string) => {
    const updatedCategories = itinerary.weatherAndPacking.packingChecklist.map((cat, idx) => {
      if (idx !== categoryIndex) return cat;
      return {
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        ),
      };
    });

    onUpdateItinerary({
      ...itinerary,
      weatherAndPacking: {
        ...itinerary.weatherAndPacking,
        packingChecklist: updatedCategories,
      },
    });
  };

  // Pack all / unpack all
  const handlePackAll = (pack: boolean) => {
    const updatedCategories = itinerary.weatherAndPacking.packingChecklist.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({ ...item, packed: pack })),
    }));
    onUpdateItinerary({
      ...itinerary,
      weatherAndPacking: {
        ...itinerary.weatherAndPacking,
        packingChecklist: updatedCategories,
      },
    });
  };

  // Filter days
  const displayedDays = selectedDayNumber === 'all'
    ? itinerary.days
    : itinerary.days.filter((d) => d.dayNumber === selectedDayNumber);

  // Category badge styling helper
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'food':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'culture':
      case 'sightseeing':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'nature':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'adventure':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'relaxation':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'nightlife':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'transit':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Packing count helper
  const totalPackingItems = itinerary.weatherAndPacking?.packingChecklist?.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  ) || 0;
  const packedCount = itinerary.weatherAndPacking?.packingChecklist?.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.packed).length,
    0
  ) || 0;

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_50%)] pointer-events-none" />
        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          
          {/* Top row badges & actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>{itinerary.destination}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                {itinerary.daysCount} Days ({itinerary.daysCount - 1} Nights)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                {itinerary.budgetTier} Budget
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 capitalize">
                {itinerary.pace} Pace
              </span>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onToggleFavorite}
                className={`p-2.5 rounded-xl border transition-all ${
                  itinerary.isFavorite
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                }`}
                title={itinerary.isFavorite ? 'Saved to favorites' : 'Mark favorite'}
              >
                <Heart className={`w-4 h-4 ${itinerary.isFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>

              <button
                onClick={onOpenRefine}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold border border-indigo-400/30 shadow-xs transition-all active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Refine with AI</span>
              </button>

              <button
                onClick={onOpenExpenseTracker}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-400/30 shadow-xs transition-all active:scale-95"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Track Spend</span>
              </button>

              <button
                onClick={onOpenExport}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 shadow-xs transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Title & Overview */}
          <div className="max-w-4xl mt-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] text-white">
              {itinerary.title}
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              {itinerary.overview}
            </p>
          </div>

          {/* Key Highlights list */}
          {itinerary.highlights && itinerary.highlights.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Curated Trip Highlights:</span>
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itinerary.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar gap-1">
        {[
          { id: 'days', label: 'Day-by-Day Itinerary', icon: Calendar, badge: `${itinerary.days.length}d` },
          { id: 'attractions', label: 'Top Attractions', icon: Landmark, badge: `${itinerary.attractions?.length || 0}` },
          { id: 'dining', label: 'Dining & Food Guide', icon: Utensils, badge: `${itinerary.dining?.length || 0}` },
          { id: 'budget', label: 'Budget & Costs', icon: DollarSign, badge: `$${itinerary.budget.totalEstimated.toLocaleString()}` },
          { id: 'packing', label: 'Weather & Packing', icon: Luggage, badge: `${packedCount}/${totalPackingItems}` },
          { id: 'guide', label: 'Local Etiquette & Tips', icon: Info },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAY-BY-DAY ITINERARY */}
      {activeTab === 'days' && (
        <div className="space-y-6">
          
          {/* Day Selector Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => setSelectedDayNumber('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDayNumber === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Days ({itinerary.days.length})
              </button>

              {itinerary.days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDayNumber === day.dayNumber
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Day {day.dayNumber}
                </button>
              ))}
            </div>

            <button
              onClick={onOpenConcierge}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center space-x-1 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200/80"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask Concierge About This Route</span>
            </button>
          </div>

          {/* Days Timeline View */}
          <div className="space-y-8">
            {displayedDays.map((day) => (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Day Header Banner */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-sky-50/40 to-teal-50/30 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs font-['Outfit']">
                        {day.dayNumber}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">
                          Day {day.dayNumber}: {day.theme}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{day.date}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                      {day.summary}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Est. Day Spend</span>
                      <p className="text-sm font-bold text-slate-800 font-mono">
                        ${day.dayBudgetEstimate || 0}
                      </p>
                    </div>

                    <button
                      onClick={() => onOpenAddActivity(day.dayNumber)}
                      className="flex items-center space-x-1 px-3 py-2 bg-white border border-slate-200 hover:border-sky-500 text-sky-700 hover:text-sky-800 rounded-xl text-xs font-bold shadow-2xs transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Activity</span>
                    </button>
                  </div>
                </div>

                {/* Activities Timeline */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="space-y-4">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="relative p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-sky-300 hover:shadow-xs transition-all bg-white group flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        {/* Activity Main Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-sky-600" />
                              <span>{act.time}</span>
                            </span>

                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadgeClass(act.category)}`}>
                              {act.category}
                            </span>

                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-medium text-slate-500">{act.duration}</span>

                            {act.bookingRequired && (
                              <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Advance Booking Advised</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                              {act.title}
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{act.location}</span>
                            </p>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            {act.description}
                          </p>

                          {act.insiderTip && (
                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-snug">
                                <strong className="font-semibold">Insider Tip:</strong> {act.insiderTip}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Cost & Activity Actions */}
                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Cost</span>
                            <p className="text-sm font-extrabold text-emerald-700 font-mono">
                              {act.estimatedCost === 0 ? 'Free' : `$${act.estimatedCost}`}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => onOpenSwapActivity(day.dayNumber, day.theme, act)}
                              className="p-1.5 text-slate-600 hover:text-sky-600 rounded-lg hover:bg-white transition-all text-xs flex items-center space-x-1 font-semibold"
                              title="Swap with AI alternatives"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                              <span className="text-[11px] hidden md:inline">Swap</span>
                            </button>
                            <button
                              onClick={() => onOpenEditActivity(day.dayNumber, act)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-white transition-all"
                              title="Edit activity"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteActivity(day.dayNumber, act.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-all"
                              title="Remove activity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Meals Section */}
                  {(day.meals.breakfast || day.meals.lunch || day.meals.dinner) && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                        <Utensils className="w-3.5 h-3.5 text-amber-600" />
                        <span>Recommended Dining for Day {day.dayNumber}</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {day.meals.breakfast && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/90 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                              ☕ Breakfast ({day.meals.breakfast.priceRange})
                            </span>
                            <h5 className="font-bold text-xs text-slate-900">{day.meals.breakfast.restaurantName}</h5>
                            <p className="text-[11px] text-slate-500">{day.meals.breakfast.cuisine}</p>
                            <p className="text-[11px] font-medium text-amber-900">
                              ✨ Must-try: {day.meals.breakfast.highlightDish}
                            </p>
                          </div>
                        )}

                        {day.meals.lunch && (
                          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100/90 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800">
                              🍽️ Lunch ({day.meals.lunch.priceRange})
                            </span>
                            <h5 className="font-bold text-xs text-slate-900">{day.meals.lunch.restaurantName}</h5>
                            <p className="text-[11px] text-slate-500">{day.meals.lunch.cuisine}</p>
                            <p className="text-[11px] font-medium text-sky-900">
                              ✨ Must-try: {day.meals.lunch.highlightDish}
                            </p>
                          </div>
                        )}

                        {day.meals.dinner && (
                          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/90 space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                              🍷 Dinner ({day.meals.dinner.priceRange})
                            </span>
                            <h5 className="font-bold text-xs text-slate-900">{day.meals.dinner.restaurantName}</h5>
                            <p className="text-[11px] text-slate-500">{day.meals.dinner.cuisine}</p>
                            <p className="text-[11px] font-medium text-emerald-900">
                              ✨ Must-try: {day.meals.dinner.highlightDish}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Transit Tip Footer */}
                  {day.transitTips && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-start space-x-2">
                      <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-slate-800">Transit Recommendation:</strong> {day.transitTips}
                      </span>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ATTRACTIONS & HIGHLIGHTS */}
      {activeTab === 'attractions' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Spotlight Attractions & Sightseeing</h3>
            <p className="text-xs text-slate-500">Key iconic sights and hidden monuments curated for this journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {itinerary.attractions?.map((attr) => (
              <div
                key={attr.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-sky-300 shadow-2xs hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                    {attr.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 font-mono">
                    {attr.estimatedCost === 0 ? 'Free Entry' : `$${attr.estimatedCost}`}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{attr.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 italic mt-0.5">{attr.tagline}</p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: {attr.recommendedDuration}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Best time: {attr.bestTimeToVisit}</span>
                  </span>
                </div>

                {attr.insiderTip && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Insider Tip:</strong> {attr.insiderTip}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DINING & GASTRONOMY GUIDE */}
      {activeTab === 'dining' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Culinary Guide & Recommended Eateries</h3>
            <p className="text-xs text-slate-500">Taste the best authentic flavors, from street food stalls to atmospheric bistros</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {itinerary.dining?.map((dine) => (
              <div
                key={dine.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                      {dine.cuisine}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {dine.priceLevel} (~${dine.avgCostPerPerson}/person)
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mt-2">{dine.name}</h4>
                  <p className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{dine.neighborhood}</span>
                  </p>

                  <div className="mt-3 p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 text-xs">
                    <span className="font-bold text-amber-900">Signature Dish:</span>
                    <p className="text-slate-700 mt-0.5">{dine.specialty}</p>
                  </div>

                  <p className="text-xs text-slate-500 mt-2.5 italic">
                    "{dine.atmosphere}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Reservation:</span>
                  <span className={`font-semibold ${dine.reservationRecommended ? 'text-amber-700' : 'text-slate-600'}`}>
                    {dine.reservationRecommended ? '⚠️ Booking Recommended' : 'Walk-ins Welcome'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BUDGET & COST BREAKDOWN */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Budget Breakdown & Expense Management</h3>
              <p className="text-xs text-slate-500">Estimated trip expenditures categorized with money-saving hacks</p>
            </div>
            <button
              onClick={onOpenExpenseTracker}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Open Live Spend Tracker</span>
            </button>
          </div>

          {/* Big Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Estimated Trip Budget</span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                ${itinerary.budget.totalEstimated.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Avg ~${Math.round(itinerary.budget.totalEstimated / itinerary.daysCount)} / day
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Accommodation</span>
              <p className="text-2xl font-black text-sky-600 mt-1 font-mono">
                ${itinerary.budget.breakdown.accommodation.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {Math.round((itinerary.budget.breakdown.accommodation / itinerary.budget.totalEstimated) * 100)}% of total
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Food & Dining</span>
              <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
                ${itinerary.budget.breakdown.foodAndDining.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {Math.round((itinerary.budget.breakdown.foodAndDining / itinerary.budget.totalEstimated) * 100)}% of total
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase">Activities & Transport</span>
              <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                ${(itinerary.budget.breakdown.activitiesAndTickets + itinerary.budget.breakdown.localTransportation).toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {Math.round(((itinerary.budget.breakdown.activitiesAndTickets + itinerary.budget.breakdown.localTransportation) / itinerary.budget.totalEstimated) * 100)}% of total
              </p>
            </div>
          </div>

          {/* Visual Progress Breakdown Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Visual Spend Allocation</h4>
            
            <div className="w-full h-4 rounded-full bg-slate-100 flex overflow-hidden">
              <div
                style={{ width: `${(itinerary.budget.breakdown.accommodation / itinerary.budget.totalEstimated) * 100}%` }}
                className="bg-sky-500"
                title="Accommodation"
              />
              <div
                style={{ width: `${(itinerary.budget.breakdown.foodAndDining / itinerary.budget.totalEstimated) * 100}%` }}
                className="bg-amber-500"
                title="Food & Dining"
              />
              <div
                style={{ width: `${(itinerary.budget.breakdown.activitiesAndTickets / itinerary.budget.totalEstimated) * 100}%` }}
                className="bg-emerald-500"
                title="Activities & Tickets"
              />
              <div
                style={{ width: `${(itinerary.budget.breakdown.localTransportation / itinerary.budget.totalEstimated) * 100}%` }}
                className="bg-teal-500"
                title="Local Transportation"
              />
              <div
                style={{ width: `${(itinerary.budget.breakdown.emergencyAndMisc / itinerary.budget.totalEstimated) * 100}%` }}
                className="bg-purple-500"
                title="Emergency & Misc"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-sky-500" />
                <span>Accommodation (${itinerary.budget.breakdown.accommodation})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-amber-500" />
                <span>Food & Dining (${itinerary.budget.breakdown.foodAndDining})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>Activities (${itinerary.budget.breakdown.activitiesAndTickets})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-teal-500" />
                <span>Transit (${itinerary.budget.breakdown.localTransportation})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-500" />
                <span>Misc (${itinerary.budget.breakdown.emergencyAndMisc})</span>
              </div>
            </div>
          </div>

          {/* Money Saving Tips */}
          {itinerary.budget.moneySavingTips && (
            <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-200/80 space-y-3">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Smart Money-Saving Tips for {itinerary.destination}</span>
              </h4>
              <ul className="space-y-2">
                {itinerary.budget.moneySavingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs sm:text-sm text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: WEATHER & PACKING CHECKLIST */}
      {activeTab === 'packing' && (
        <div className="space-y-6">
          {/* Weather Card */}
          <div className="bg-gradient-to-r from-amber-500 via-sky-600 to-teal-600 text-white p-6 rounded-3xl shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Destination Weather & Climate</span>
                <h3 className="text-xl sm:text-2xl font-black mt-1 font-['Outfit']">
                  {itinerary.weatherAndPacking.averageTemp}
                </h3>
                <p className="text-xs sm:text-sm text-sky-100 mt-1">
                  {itinerary.weatherAndPacking.expectedWeather}
                </p>
              </div>
              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-2xl text-xs max-w-sm border border-white/20">
                <span className="font-bold text-amber-200">Seasonal Advice:</span>
                <p className="mt-0.5 text-slate-100">{itinerary.weatherAndPacking.seasonAdvice}</p>
              </div>
            </div>
          </div>

          {/* Packing Checklist Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-['Outfit']">Smart Packing Checklist</h4>
              <p className="text-xs text-slate-500">
                {packedCount} of {totalPackingItems} items packed ({totalPackingItems > 0 ? Math.round((packedCount / totalPackingItems) * 100) : 0}%)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePackAll(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Pack All
              </button>
              <button
                onClick={() => handlePackAll(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Packing Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {itinerary.weatherAndPacking.packingChecklist.map((cat, catIdx) => (
              <div key={cat.category} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h5 className="font-bold text-sm text-slate-900">{cat.category}</h5>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {cat.items.filter((i) => i.packed).length}/{cat.items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleTogglePackingItem(catIdx, item.id)}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        item.packed
                          ? 'bg-slate-50/70 border-slate-200 text-slate-400 line-through'
                          : 'bg-white border-slate-200/90 text-slate-800 hover:border-sky-300'
                      }`}
                    >
                      {item.packed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="text-xs font-medium leading-snug">{item.item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LOCAL TRAVEL GUIDE & ETIQUETTE */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          
          {/* Tipping & Getting Around */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4" />
                <span>Tipping Etiquette</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {itinerary.localTips.tippingCulture}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>Getting Around & Transit</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {itinerary.localTips.gettingAround}
              </p>
            </div>
          </div>

          {/* Etiquette Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Local Customs & Etiquette Dos and Don'ts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {itinerary.localTips.localEtiquette.map((rule, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Useful Local Phrases */}
          {itinerary.localTips.usefulPhrases && itinerary.localTips.usefulPhrases.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-amber-500" />
                <span>Essential Local Phrases</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {itinerary.localTips.usefulPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1">
                    <p className="text-xs font-bold text-slate-900">"{phrase.phrase}"</p>
                    <p className="text-[11px] text-slate-500">Meaning: {phrase.translation}</p>
                    {phrase.pronunciation && (
                      <p className="text-[10px] text-amber-800 font-mono italic">
                        Pronunciation: {phrase.pronunciation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety & Emergency */}
          <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Safety & Emergency Contacts</span>
              </h5>
              <p className="text-xs text-rose-800 leading-relaxed max-w-xl">
                {itinerary.localTips.safetyNotes}
              </p>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-rose-200 text-right shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Emergency Dial</span>
              <p className="text-sm font-black text-rose-700 font-mono">{itinerary.localTips.emergencyNumbers}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
