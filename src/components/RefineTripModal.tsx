import React, { useState } from 'react';
import { X, Sparkles, Send, Wand2, ArrowRight } from 'lucide-react';
import { Itinerary } from '../types.ts';

interface RefineTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
  onRefined: (updatedItinerary: Itinerary) => void;
}

export const RefineTripModal: React.FC<RefineTripModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  onRefined,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const SUGGESTED_REFINEMENTS = [
    'Make all dining recommendations strictly vegetarian',
    'Start days at 10:00 AM for a more relaxing, sleepy morning pace',
    'Add more sunset rooftop viewpoints and evening lounges',
    'Tighten the budget and highlight free walking trails & markets',
    'Focus heavily on art, hidden craft ateliers, and boutique shopping',
  ];

  const handleRefine = async (customInstruction?: string) => {
    const textToUse = customInstruction || instruction;
    if (!textToUse.trim()) {
      setError('Please provide an instruction for how to tweak the itinerary.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/refine-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itinerary,
          instruction: textToUse.trim(),
        }),
      });

      const data = await res.json();
      if (data.itinerary) {
        onRefined(data.itinerary);
        onClose();
      } else {
        setError('Could not refine itinerary. Please try again.');
      }
    } catch (err) {
      console.error('Refine error:', err);
      setError('Failed to contact AI engine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-xs">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Refine Itinerary with AI</h3>
              <p className="text-xs text-slate-500">Ask TravelMate AI to adjust schedules, themes, or dining</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              What would you like to adjust or personalize?
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => {
                setInstruction(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 'Can you replace the museum on Day 2 with an outdoor hike?' or 'Add more romantic wine bars for evenings'..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              disabled={isLoading}
            />
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Or click a popular prompt:</span>
            </p>
            <div className="space-y-1.5">
              {SUGGESTED_REFINEMENTS.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setInstruction(item);
                    handleRefine(item);
                  }}
                  disabled={isLoading}
                  className="w-full text-left text-xs p-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200/80 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{item}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleRefine()}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Applying Tweaks...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Update Itinerary</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
