import React, { useState } from 'react';
import { X, Clock, MapPin, DollarSign, Lightbulb, CheckSquare, Plus, Save } from 'lucide-react';
import { Activity } from '../types.ts';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  initialActivity?: Activity | null;
  onSave: (dayNumber: number, activity: Activity) => void;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  initialActivity,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialActivity;

  const [timeSlot, setTimeSlot] = useState<'morning' | 'afternoon' | 'evening'>(
    initialActivity?.timeSlot || 'morning'
  );
  const [time, setTime] = useState(initialActivity?.time || '09:30 AM');
  const [title, setTitle] = useState(initialActivity?.title || '');
  const [location, setLocation] = useState(initialActivity?.location || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [duration, setDuration] = useState(initialActivity?.duration || '2 hours');
  const [estimatedCost, setEstimatedCost] = useState(initialActivity?.estimatedCost?.toString() || '0');
  const [category, setCategory] = useState<Activity['category']>(initialActivity?.category || 'sightseeing');
  const [insiderTip, setInsiderTip] = useState(initialActivity?.insiderTip || '');
  const [bookingRequired, setBookingRequired] = useState(initialActivity?.bookingRequired || false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Activity title is required');
      return;
    }

    const newActivity: Activity = {
      id: initialActivity?.id || `act-custom-${Date.now()}`,
      timeSlot,
      time: time.trim(),
      title: title.trim(),
      location: location.trim() || 'Central District',
      description: description.trim(),
      duration: duration.trim() || '1.5 hours',
      estimatedCost: parseFloat(estimatedCost) || 0,
      category,
      insiderTip: insiderTip.trim() || undefined,
      bookingRequired,
    };

    onSave(dayNumber, newActivity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'Edit Activity' : 'Add Activity to Day ' + dayNumber}
            </h3>
            <p className="text-xs text-slate-500">Customize your personalized schedule</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Time Slot & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time (e.g. 10:00 AM)</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="09:00 AM"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Traditional Matcha Tea Tasting"
            />
          </div>

          {/* Location & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location / Landmark</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="District or venue name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="sightseeing">Sightseeing</option>
                <option value="culture">Culture & History</option>
                <option value="food">Food & Dining</option>
                <option value="nature">Nature & Outdoors</option>
                <option value="adventure">Adventure</option>
                <option value="relaxation">Relaxation</option>
                <option value="nightlife">Nightlife</option>
                <option value="transit">Transit</option>
              </select>
            </div>
          </div>

          {/* Duration & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g. 2 hours"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Cost ($ USD)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="What makes this experience special..."
            />
          </div>

          {/* Insider Tip */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Insider Tip (Optional)</label>
            <input
              type="text"
              value={insiderTip}
              onChange={(e) => setInsiderTip(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g. Book in advance or bring cash"
            />
          </div>

          {/* Advance Booking Required Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="bookingReq"
              checked={bookingRequired}
              onChange={(e) => setBookingRequired(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded-sm border-slate-300 focus:ring-sky-500"
            />
            <label htmlFor="bookingReq" className="text-xs font-medium text-slate-700 cursor-pointer">
              Advance booking or ticket reservation recommended
            </label>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              {isEditing ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isEditing ? 'Save Changes' : 'Add Activity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
