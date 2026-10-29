import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowRightLeft, Sparkles, Clock, MapPin, DollarSign, Check, Filter } from 'lucide-react';
import { Activity } from '../types.ts';

interface SwapActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  dayNumber: number;
  currentTheme: string;
  activityToSwap: Activity | null;
  onSelectAlternative: (dayNumber: number, oldActivityId: string, newActivity: Activity) => void;
}

export const SwapActivityModal: React.FC<SwapActivityModalProps> = ({
  isOpen,
  onClose,
  destination,
  dayNumber,
  currentTheme,
  activityToSwap,
  onSelectAlternative,
}) => {
  const [alternatives, setAlternatives] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterPreference, setFilterPreference] = useState('');
  const [customSearch, setCustomSearch] = useState('');

  const fetchAlternatives = async (preference?: string) => {
    if (!activityToSwap) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/suggest-alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          activity: activityToSwap,
          currentTheme,
          preferenceFilter: preference || filterPreference || customSearch || 'balanced scenic or cultural alternative',
        }),
      });
      const data = await res.json();
      if (data.alternatives && data.alternatives.length > 0) {
        setAlternatives(data.alternatives);
      }
    } catch (err) {
      console.error('Failed to suggest alternatives', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activityToSwap) {
      fetchAlternatives();
    }
  }, [isOpen, activityToSwap]);

  if (!isOpen || !activityToSwap) return null;

  const handleSelect = (alt: Activity) => {
    onSelectAlternative(dayNumber, activityToSwap.id, alt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Swap Activity</h3>
              <p className="text-xs text-slate-500">Day {dayNumber}: {currentTheme}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Activity Banner */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Replacing current plan:</span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-sm font-bold text-slate-800">{activityToSwap.title}</h4>
            <span className="text-xs font-semibold text-slate-500">{activityToSwap.time} ({activityToSwap.duration})</span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{activityToSwap.description}</p>
        </div>

        {/* Quick Filters */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Suggestion Filters:</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'rainy', label: '🌧️ Indoor / Rainy Day' },
              { id: 'budget', label: '💵 Low Cost / Free' },
              { id: 'relaxing', label: '☕ Relaxing & Slow' },
              { id: 'foodie', label: '🍜 Food & Culinary' },
              { id: 'hidden', label: '💎 Hidden Secret' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilterPreference(f.label);
                  fetchAlternatives(f.label);
                }}
                disabled={isLoading}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  filterPreference === f.label
                    ? 'bg-sky-50 border-sky-400 text-sky-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alternatives List */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recommended Alternatives</h5>
            <button
              onClick={() => fetchAlternatives()}
              disabled={isLoading}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Options</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500">Searching smart alternatives for {destination}...</p>
            </div>
          ) : (
            alternatives.map((alt) => (
              <div
                key={alt.id}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-xs transition-all bg-white group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                        {alt.category}
                      </span>
                      <h6 className="font-bold text-sm text-slate-900 mt-1">{alt.title}</h6>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ${alt.estimatedCost}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{alt.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{alt.duration}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[200px]">{alt.location}</span>
                    </span>
                  </div>

                  {alt.insiderTip && (
                    <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-100 flex items-start space-x-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span>{alt.insiderTip}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleSelect(alt)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Swap with this</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
