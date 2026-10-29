import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { TripPlannerWizard } from './components/TripPlannerWizard.tsx';
import { ItineraryView } from './components/ItineraryView.tsx';
import { SavedTripsView } from './components/SavedTripsView.tsx';
import { ActivityModal } from './components/ActivityModal.tsx';
import { SwapActivityModal } from './components/SwapActivityModal.tsx';
import { RefineTripModal } from './components/RefineTripModal.tsx';
import { ExpenseTrackerModal } from './components/ExpenseTrackerModal.tsx';
import { ExportModal } from './components/ExportModal.tsx';
import { TravelConciergeModal } from './components/TravelConciergeModal.tsx';
import { SAMPLE_TRIPS } from './data/sampleTrips.ts';
import { Itinerary, TripPreferences, Activity, ExpenseRecord } from './types.ts';
import { PlusCircle, Sparkles, Compass, Bookmark, Plane, MapPin } from 'lucide-react';

const STORAGE_KEY = 'travelmate_trips_v1';

export default function App() {
  // Load saved trips from localStorage or fallback to sample trips
  const [trips, setTrips] = useState<Itinerary[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored trips', e);
    }
    return SAMPLE_TRIPS;
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    return trips[0]?.id || null;
  });

  const [currentTab, setCurrentTab] = useState<'planner' | 'saved' | 'concierge'>('planner');
  const [showWizard, setShowWizard] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals state
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityModalDay, setActivityModalDay] = useState(1);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapModalData, setSwapModalData] = useState<{
    dayNumber: number;
    currentTheme: string;
    activity: Activity | null;
  }>({ dayNumber: 1, currentTheme: '', activity: null });

  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [isExpenseTrackerOpen, setIsExpenseTrackerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  // Sync trips to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Failed to save trips to localStorage', e);
    }
  }, [trips]);

  const activeItinerary = trips.find((t) => t.id === activeTripId) || trips[0] || null;

  // Handle AI trip generation
  const handleGenerateItinerary = async (prefs: TripPreferences) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      const data = await res.json();
      if (data.itinerary) {
        const newTrip = data.itinerary as Itinerary;
        setTrips((prev) => [newTrip, ...prev]);
        setActiveTripId(newTrip.id);
        setShowWizard(false);
        setCurrentTab('planner');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update an itinerary
  const handleUpdateItinerary = (updated: Itinerary) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  // Toggle favorite
  const handleToggleFavorite = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  // Duplicate trip
  const handleDuplicateTrip = (tripId: string) => {
    const existing = trips.find((t) => t.id === tripId);
    if (!existing) return;
    const duplicated: Itinerary = {
      ...existing,
      id: `trip-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
    };
    setTrips((prev) => [duplicated, ...prev]);
    setActiveTripId(duplicated.id);
    setCurrentTab('planner');
    setShowWizard(false);
  };

  // Delete trip
  const handleDeleteTrip = (tripId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this trip itinerary?');
    if (!confirmed) return;
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (activeTripId === tripId) {
      const remaining = trips.filter((t) => t.id !== tripId);
      setActiveTripId(remaining[0]?.id || null);
    }
  };

  // Select trip
  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    setShowWizard(false);
    setCurrentTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add or edit activity in day
  const handleSaveActivity = (dayNumber: number, activity: Activity) => {
    if (!activeItinerary) return;

    const updatedDays = activeItinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;

      const exists = day.activities.some((a) => a.id === activity.id);
      let newActivities: Activity[];
      if (exists) {
        newActivities = day.activities.map((a) => (a.id === activity.id ? activity : a));
      } else {
        newActivities = [...day.activities, activity];
      }

      return {
        ...day,
        activities: newActivities,
        dayBudgetEstimate: newActivities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0) + 40,
      };
    });

    handleUpdateItinerary({
      ...activeItinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete activity from day
  const handleDeleteActivity = (dayNumber: number, activityId: string) => {
    if (!activeItinerary) return;
    const updatedDays = activeItinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      };
    });
    handleUpdateItinerary({
      ...activeItinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    });
  };

  // Swap activity alternative
  const handleSwapAlternative = (dayNumber: number, oldId: string, newActivity: Activity) => {
    if (!activeItinerary) return;
    const updatedDays = activeItinerary.days.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((a) => (a.id === oldId ? newActivity : a)),
      };
    });
    handleUpdateItinerary({
      ...activeItinerary,
      days: updatedDays,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add expense
  const handleAddExpense = (expense: ExpenseRecord) => {
    if (!activeItinerary) return;
    const currentExpenses = activeItinerary.expenses || [];
    handleUpdateItinerary({
      ...activeItinerary,
      expenses: [expense, ...currentExpenses],
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete expense
  const handleDeleteExpense = (expenseId: string) => {
    if (!activeItinerary) return;
    const currentExpenses = activeItinerary.expenses || [];
    handleUpdateItinerary({
      ...activeItinerary,
      expenses: currentExpenses.filter((e) => e.id !== expenseId),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'planner') setShowWizard(false);
        }}
        activeItinerary={activeItinerary}
        savedTripsCount={trips.length}
        onNewTrip={() => {
          setShowWizard(true);
          setCurrentTab('planner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenConcierge={() => setIsConciergeOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* SAVED TRIPS TAB */}
        {currentTab === 'saved' && (
          <SavedTripsView
            trips={trips}
            activeTripId={activeTripId}
            onSelectTrip={handleSelectTrip}
            onToggleFavorite={handleToggleFavorite}
            onDuplicateTrip={handleDuplicateTrip}
            onDeleteTrip={handleDeleteTrip}
            onNewTrip={() => {
              setShowWizard(true);
              setCurrentTab('planner');
            }}
          />
        )}

        {/* PLANNER TAB */}
        {currentTab === 'planner' && (
          <>
            {showWizard || !activeItinerary ? (
              <TripPlannerWizard
                onGenerate={handleGenerateItinerary}
                isLoading={isGenerating}
                hasExistingTrips={trips.length > 0}
                onCancel={() => setShowWizard(false)}
              />
            ) : (
              <div className="space-y-6">
                {/* Switcher bar if multiple trips exist */}
                {trips.length > 1 && (
                  <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Bookmark className="w-3.5 h-3.5 text-sky-600" />
                      <span className="font-semibold text-slate-700">Currently viewing:</span>
                      <select
                        value={activeTripId || ''}
                        onChange={(e) => setActiveTripId(e.target.value)}
                        className="font-bold text-slate-900 bg-transparent border-0 focus:ring-0 cursor-pointer text-xs"
                      >
                        {trips.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.destination})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setShowWizard(true)}
                      className="text-sky-700 hover:text-sky-800 font-bold flex items-center space-x-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Plan Another Trip</span>
                    </button>
                  </div>
                )}

                <ItineraryView
                  itinerary={activeItinerary}
                  onUpdateItinerary={handleUpdateItinerary}
                  onOpenRefine={() => setIsRefineModalOpen(true)}
                  onOpenExpenseTracker={() => setIsExpenseTrackerOpen(true)}
                  onOpenExport={() => setIsExportModalOpen(true)}
                  onOpenConcierge={() => setIsConciergeOpen(true)}
                  onOpenAddActivity={(dayNum) => {
                    setActivityModalDay(dayNum);
                    setEditingActivity(null);
                    setIsActivityModalOpen(true);
                  }}
                  onOpenEditActivity={(dayNum, act) => {
                    setActivityModalDay(dayNum);
                    setEditingActivity(act);
                    setIsActivityModalOpen(true);
                  }}
                  onOpenSwapActivity={(dayNum, currentTheme, act) => {
                    setSwapModalData({ dayNumber: dayNum, currentTheme, activity: act });
                    setIsSwapModalOpen(true);
                  }}
                  onDeleteActivity={handleDeleteActivity}
                  onToggleFavorite={() => handleToggleFavorite(activeItinerary.id)}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* MODALS */}
      {/* 1. Add / Edit Activity */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        dayNumber={activityModalDay}
        initialActivity={editingActivity}
        onSave={handleSaveActivity}
      />

      {/* 2. Swap Activity Alternatives */}
      {activeItinerary && (
        <SwapActivityModal
          isOpen={isSwapModalOpen}
          onClose={() => setIsSwapModalOpen(false)}
          destination={activeItinerary.destination}
          dayNumber={swapModalData.dayNumber}
          currentTheme={swapModalData.currentTheme}
          activityToSwap={swapModalData.activity}
          onSelectAlternative={handleSwapAlternative}
        />
      )}

      {/* 3. Refine Itinerary with AI */}
      {activeItinerary && (
        <RefineTripModal
          isOpen={isRefineModalOpen}
          onClose={() => setIsRefineModalOpen(false)}
          itinerary={activeItinerary}
          onRefined={handleUpdateItinerary}
        />
      )}

      {/* 4. Live Expense Tracker */}
      {activeItinerary && (
        <ExpenseTrackerModal
          isOpen={isExpenseTrackerOpen}
          onClose={() => setIsExpenseTrackerOpen(false)}
          itinerary={activeItinerary}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {/* 5. Export Modal */}
      {activeItinerary && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          itinerary={activeItinerary}
        />
      )}

      {/* 6. Travel Concierge Q&A */}
      <TravelConciergeModal
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
        destination={activeItinerary?.destination || 'your destination'}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-800 font-['Outfit']">TravelMate AI</span>
            <span>• Personalized Day-by-Day Travel Planner</span>
          </div>
          <p className="text-slate-400">
            Powered by Generative AI • Smart budget estimates, dining guides, and offline exports
          </p>
        </div>
      </footer>

    </div>
  );
}
