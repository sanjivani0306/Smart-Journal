import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Send,
  User,
  Bot,
  BookOpen,
} from 'lucide-react';

export function ReflectionCompanion({ entries, selectedEntry }) {
  const { authFetch, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello${user?.name ? ' ' + user.name.split(' ')[0] : ''}! I am your AI Reflection Companion. I have context on your journal entries and emotional patterns. 

Whether you want to unpack a stressful moment, celebrate a win, explore a recurring habit, or do a gentle evening debrief, I am here to listen and help you reflect with compassion. What's on your mind?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // The current FastAPI backend does not expose a chat/reflection endpoint yet.
      // Provide a useful local reflection until that endpoint is added.
      const recent = entries.slice(0, 5);
      const moods = recent.map(e => e.aiAnalysis?.moodCategory || e.manualMood).filter(Boolean);
      const botReply = selectedEntry
        ? `Let's reflect on “${selectedEntry.title}”. You described: ${selectedEntry.content.slice(0, 220)}${selectedEntry.content.length > 220 ? '…' : ''}. What part of that experience feels most important to you now?`
        : moods.length
          ? `From your recent entries, I can see these moods: ${moods.join(', ')}. A useful next step is to notice what events tend to appear before your mood changes. Which recent moment would you like to explore?`
          : `I’m ready to help you reflect. Start by describing one moment from today that stayed with you, and what you think made it meaningful.`;


      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Reflection error:', err);
      const fallbackMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `I'm here with you. When you reflect on what you just shared, what is one kind thing you can tell yourself right now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "What patterns do you notice in my recent entries?",
    "Help me unpack why I felt overwhelmed recently.",
    "Give me a guided 3-minute evening reflection.",
    "What can I do to protect my morning focus?",
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden flex flex-col h-[650px]">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm tracking-tight flex items-center gap-2">
              Reflective Coaching Companion
              <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                Gemini 3.7 Flash
              </span>
            </h3>
            <p className="text-xs text-stone-700">
              Personalized philosophical & psychological inquiry grounded in your diary
            </p>
          </div>
        </div>

        {selectedEntry && (
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl text-xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-medium text-amber-900 truncate max-w-xs">
              Context: {selectedEntry.title}
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/30">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] sm:max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-stone-900 text-white rounded-tr-xs'
                    : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    isUser ? 'text-stone-400' : 'text-stone-700'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 text-xs text-stone-500 shadow-2xs flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Reflecting on your journal history...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      <div className="p-3 bg-white border-t border-stone-100 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[10px] font-bold uppercase text-stone-700 tracking-wider shrink-0 pl-1">
          Try Asking:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="whitespace-nowrap text-xs bg-stone-50 hover:bg-indigo-50 hover:text-indigo-900 border border-stone-200 hover:border-indigo-200 text-stone-700 rounded-lg px-2.5 py-1 transition-colors shrink-0 cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Share your thoughts or ask for a reflection on a past entry..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
