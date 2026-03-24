import { useState, useRef, useEffect } from 'react';
import { aiChat } from '../../services/api';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  'Which jobs should I apply to?',
  'What skills am I missing?',
  'How can I improve my profile?',
  'What is my placement chance?',
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your PlacePro AI career coach 👋 I can see your profile, skills, and applications. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = messages.filter(m => m.role !== 'system');
      const res = await aiChat(msg, history);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (e) {
      const errMsg = e?.response?.data?.error || 'Something went wrong. Try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-13 h-13 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 px-4 py-3 hover:scale-105 transition-transform"
      >
        {open ? <X className="w-5 h-5" /> : <><Sparkles className="w-4 h-4" /><span className="text-sm font-semibold hidden sm:block">AI Coach</span></>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-36 right-4 lg:bottom-20 lg:right-6 z-40 w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden animate-fade-in"
          style={{ height: '420px' }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">PlacePro AI Coach</p>
              <p className="text-white/70 text-[10px]">Powered by Groq · Llama 3</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-primary-500" />
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only show when just opened */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-[10px] px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full border border-primary-100 dark:border-primary-800 hover:bg-primary-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1 border-t border-gray-100 dark:border-slate-700">
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Ask your AI coach..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
