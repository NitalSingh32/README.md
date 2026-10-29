import React, { useState } from 'react';
import { 
  Bookmark, 
  Heart, 
  MapPin, 
  Calendar, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Search, 
  PlusCircle, 
  Sparkles,
  Luggage,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Itinerary } from '../types.ts';

interface SavedTripsViewProps {
  trips: Itinerary[];
  activeTripId: string | null;
  onSelectTrip: (tripId: string) => void;
  onToggleFavorite: (tripId: string) => void;
  onDuplicateTrip: (tripId: string) => void;
  onDeleteTrip: (tripId: string) => void;
  onNewTrip: () => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  trips,
  activeTripId,
  onSelectTrip,
  onToggleFavorite,
  onDuplicateTrip,
  onDeleteTrip,
  onNewTrip,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = favoritesOnly ? !!t.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-['Outfit'] flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-emerald-600" />
            <span>My Saved Itineraries</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {trips.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage, review, duplicate, and customize your trips</p>
        </div>

        {/* Search & Favorite Toggle */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`p-2.5 rounded-xl border transition-all ${
              favoritesOnly
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
            title="Show favorites only"
          >
            <Heart className={`w-4 h-4 ${favoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={onNewTrip}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Plan Trip</span>
          </button>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Luggage className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No saved itineraries found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || favoritesOnly
                ? 'No trips matched your search filter. Try clearing filters.'
                : 'Start your journey by creating an AI-personalized travel itinerary.'}
            </p>
          </div>
          <button
            onClick={onNewTrip}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Trip</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => {
            const isActive = trip.id === activeTripId;
            return (
              <div
                key={trip.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-2xs hover:shadow-md ${
                  isActive ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top / Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">
                      {trip.daysCount} Days • {trip.pace}
                    </span>

                    <button
                      onClick={() => onToggleFavorite(trip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                      title={trip.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          trip.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 mt-2.5 group-hover:text-sky-600 transition-colors line-clamp-1">
                    {trip.title}
                  </h3>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                    {trip.overview}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{trip.startDate}</span>
                    </div>

                    <div className="font-bold text-slate-900 font-mono">
                      ~${trip.budget?.totalEstimated?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Actions */}
                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onDuplicateTrip(trip.id)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Duplicate trip"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectTrip(trip.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs active:scale-95 transition-all"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
