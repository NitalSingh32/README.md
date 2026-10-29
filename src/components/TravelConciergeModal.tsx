import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, Compass, HelpCircle } from 'lucide-react';

interface TravelConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const TravelConciergeModal: React.FC<TravelConciergeModalProps> = ({
  isOpen,
  onClose,
  destination,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! I am your AI Travel Concierge for ${destination || 'your trip'}. Feel free to ask me anything about local transit passes, SIM/eSIM cards, safety, hidden spots, or cultural tipping etiquette!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const PROMPT_CHIPS = [
    `Best way to get mobile internet / eSIM in ${destination || 'this city'}?`,
    `What are the most common tourist scams to watch out for in ${destination || 'here'}?`,
    `How does public transit payment work in ${destination || 'this region'}?`,
    `What are 3 authentic local dishes I must not miss?`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', text: textToSend.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination || 'Global Destination',
          question: textToSend.trim(),
        }),
      });
      const data = await res.json();
      const assistantMsg: Message = {
        sender: 'assistant',
        text: data.answer || 'I am ready to help with your trip!',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the concierge assistant at the moment. Please try again shortly!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full h-[600px] flex flex-col shadow-2xl border border-slate-100 my-8 transition-all animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Outfit']">AI Travel Concierge</h3>
              <p className="text-xs text-sky-100">Live advice & insider tips for {destination || 'your destination'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-600 text-white font-medium rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs rounded-tl-xs whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 pl-9">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
              <span>Checking local destination knowledge...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex space-x-1.5 no-scrollbar">
          {PROMPT_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              disabled={isLoading}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 text-[11px] font-medium transition-colors border border-slate-200/60"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2 rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={`Ask about ${destination || 'this destination'}...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
