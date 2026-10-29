import React, { useState } from 'react';
import { X, Calendar, Printer, FileText, Share2, Check, Download, Copy, Sparkles } from 'lucide-react';
import { Itinerary } from '../types.ts';
import { exportToICS, exportToMarkdown } from '../utils/itineraryUtils.ts';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: Itinerary;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  itinerary,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    const md = exportToMarkdown(itinerary);
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export & Share Trip</h3>
              <p className="text-xs text-slate-500">Take your itinerary anywhere you go</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="mt-5 space-y-3">
          
          {/* Download ICS */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Add to Calendar (.ICS)</h4>
                <p className="text-xs text-slate-500">Sync with Google Calendar, Apple iCal, or Outlook</p>
              </div>
            </div>
            <button
              onClick={() => exportToICS(itinerary)}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-sky-500 text-sky-700 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Copy Markdown */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Copy Markdown Notes</h4>
                <p className="text-xs text-slate-500">Paste neatly into Notion, Apple Notes, or email</p>
              </div>
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-indigo-500 text-indigo-700 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Print / Save as PDF */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Print or Save as PDF</h4>
                <p className="text-xs text-slate-500">Print-optimized clean itinerary layout</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-amber-500 text-amber-800 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>

          {/* Share Link */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-700">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Copy Shareable Link</h4>
                <p className="text-xs text-slate-500">Share your custom trip with travel companions</p>
              </div>
            </div>
            <button
              onClick={handleCopyShareLink}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-teal-500 text-teal-700 rounded-lg text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
