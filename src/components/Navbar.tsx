import React from 'react';
import { 
  Compass, 
  Bookmark, 
  Sparkles, 
  PlusCircle, 
  MessageSquareText, 
  MapPin,
  Palmtree
} from 'lucide-react';
import { Itinerary } from '../types.ts';

interface NavbarProps {
  currentTab: 'planner' | 'saved' | 'concierge';
  onSelectTab: (tab: 'planner' | 'saved' | 'concierge') => void;
  activeItinerary: Itinerary | null;
  savedTripsCount: number;
  onNewTrip: () => void;
  onOpenConcierge: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeItinerary,
  savedTripsCount,
  onNewTrip,
  onOpenConcierge,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('planner')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Palmtree className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-['Outfit']">TravelMate</span>
              <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 font-mono">AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Personalized Itinerary Planner</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onSelectTab('planner')}
            className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentTab === 'planner'
                ? 'bg-sky-50 text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span className="hidden xs:inline">Trip Planner</span>
          </button>

          <button
            onClick={() => onSelectTab('saved')}
            className={`flex items-center space-x-2 px-3 sm:px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
              currentTab === 'saved'
                ? 'bg-sky-50 text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Bookmark className="w-4 h-4 text-emerald-600" />
            <span>My Trips</span>
            {savedTripsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {savedTripsCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenConcierge}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
            title="Ask AI Destination Concierge"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline">AI Concierge</span>
          </button>
        </nav>

        {/* Primary CTA */}
        <div className="flex items-center space-x-2">
          {activeItinerary && (
            <div className="hidden lg:flex items-center space-x-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span className="truncate max-w-[140px] font-semibold text-slate-700">{activeItinerary.destination}</span>
              <span>•</span>
              <span>{activeItinerary.daysCount}d</span>
            </div>
          )}

          <button
            onClick={onNewTrip}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:shadow transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Trip</span>
          </button>
        </div>

      </div>
    </header>
  );
};
