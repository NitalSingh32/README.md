import React, { useState } from 'react';
import { X, DollarSign, Plus, Trash2, Tag, Calendar, Wallet } from 'lucide-react';
import { Itinerary, ExpenseRecord } from '../types.ts';

interface ExpenseTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ExpenseTrackerModal: React.FC<ExpenseTrackerModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  onAddExpense,
  onDeleteExpense,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('food');
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [error, setError] = useState('');

  const expenses = itinerary.expenses || [];
  const totalLogged = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const estimatedTotal = itinerary.budget.totalEstimated;
  const remaining = estimatedTotal - totalLogged;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      setError('Please provide expense description and amount.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive number for amount.');
      return;
    }

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      dayNumber,
      category,
      title: title.trim(),
      amount: parsedAmount,
      date: itinerary.days[dayNumber - 1]?.date || new Date().toISOString().split('T')[0],
    };

    onAddExpense(newExpense);
    setTitle('');
    setAmount('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Trip Expense Tracker</h3>
              <p className="text-xs text-slate-500">Track real spend against estimated budget</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Budget Summary Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Target Budget</span>
            <p className="text-base font-black text-slate-900 font-mono">${estimatedTotal.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Spent</span>
            <p className="text-base font-black text-emerald-600 font-mono">${totalLogged.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Remaining</span>
            <p className={`text-base font-black font-mono ${remaining >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
              ${remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Add Expense Form */}
        <form onSubmit={handleSubmit} className="mt-4 p-3.5 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3">
          <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center space-x-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Log an Expense</span>
          </h4>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Expense Item</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sushi lunch or Metro pass"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount ($ USD)</label>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="food">🍽️ Food & Dining</option>
                <option value="activity">🎟️ Activities & Tickets</option>
                <option value="transit">🚇 Transportation</option>
                <option value="accommodation">🏨 Hotel / Stay</option>
                <option value="other">🛍️ Shopping / Misc</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Day</label>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {itinerary.days.map((d) => (
                  <option key={d.dayNumber} value={d.dayNumber}>
                    Day {d.dayNumber} ({d.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </form>

        {/* Expenses List */}
        <div className="mt-4">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Logged Expenses ({expenses.length})
          </h5>
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">No expenses logged yet. Add your first spend above!</p>
            ) : (
              expenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-600">
                      Day {item.dayNumber}
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="font-bold text-slate-900 font-mono">${item.amount.toLocaleString()}</span>
                    <button
                      onClick={() => onDeleteExpense(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
