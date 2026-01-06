import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { MediPulseLogo } from './MediPulseLogo';

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! 👋 I'm MediPulse, your personal health assistant. I can provide **basic answers about medical conditions**, analyze your symptoms, and help you manage your health. How are you feeling today?",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for locking and rate limiting
  const isProcessingRef = useRef(false);
  const lastRequestTimeRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getLocalResponse = (input: string): string | null => {
    const text = input.toLowerCase();
    if (text.includes('fever')) return "A fever is usually a sign that your body is fighting off an infection. Rest, stay hydrated, and monitor your temperature. If it exceeds 103°F (39.4°C) or lasts more than 3 days, please consult a doctor. 🌡️";
    if (text.includes('headache')) return "Headaches can be caused by stress, dehydration, or eye strain. Try resting in a dark room and drinking water. If it's severe or accompanied by vision changes, seek medical help. 🤕";
    if (text.includes('cough')) return "A cough can be viral or due to allergies. Stay hydrated, try honey (for those over 1 year old), and use a humidifier. If you have difficulty breathing or it lasts >3 weeks, see a doctor. 🗣️";
    if (text.includes('stomach') || text.includes('abdominal')) return "Stomach pain can range from indigestion to more serious issues. Try small sips of water or ginger tea. Avoid heavy foods. If the pain is severe, localized (like bottom right), or you have a high fever, seek urgent care. 🤢";
    if (text.includes('cold') || text.includes('flu')) return "For a common cold or flu, the best treatment is usually rest, plenty of fluids, and over-the-counter pain relievers if needed. Symptoms typically peak at 2-3 days and can last up to 2 weeks. 🤧";
    if (text.includes('burn')) return "For minor burns, run cool (not cold) water over the area for 10-20 minutes. Don't use ice or butter. Cover with a sterile bandage. See a doctor if it's large, deep, or on the face/hands. 🔥";
    if (text.includes('sleep') || text.includes('insomnia')) return "Good sleep hygiene involves a consistent schedule, a dark/cool room, and avoiding screens 1 hour before bed. Try relaxation techniques if you're struggling to drift off. 😴";
    if (text.includes('diabetes')) return "Diabetes is a chronic condition that affects how your body turns food into energy. It's crucial to monitor blood sugar, eat a balanced diet, and stay active as prescribed by your doctor. 🩸";
    if (text.includes('hello') || text.includes('hi')) return "Hello! I'm your MediPulse assistant. How can I help you with your health today? 😊";
    if (text.includes('appointment')) return "You can book an appointment by clicking the 'Book' tab in the bottom navigation menu. 📅";
    if (text.includes('who are you')) return "I am MediPulse AI, your personal health assistant designed to help you track vitals and manage your medical needs. 🤖";
    if (text.includes('thank')) return "You're very welcome! Stay healthy! 💙";
    return null;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setIsProcessing(true);

    // Placeholder for bot message
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isTyping: true
    }]);

    // Try local response first for speed and simplicity
    const localAnswer = getLocalResponse(currentInput);

    if (localAnswer) {
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMsgId
              ? { ...msg, text: localAnswer, isTyping: false }
              : msg
          )
        );
        setIsProcessing(false);
      }, 800);
      return;
    }

    try {
      const stream = await sendMessageToGemini(currentInput);
      let fullText = '';

      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === botMsgId
                ? { ...msg, text: fullText, isTyping: false }
                : msg
            )
          );
        }
      }
    } catch (error: any) {
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, text: "I'm here to help, but I'm having a little trouble connecting to my brain. Please try asking in a different way!", isTyping: false }
          : msg
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative font-['Plus_Jakarta_Sans'] animate-fade-in">
      {/* Attractive Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 p-6 flex items-center gap-4 text-white shadow-lg z-10">
        <div className="bg-white p-2 rounded-full backdrop-blur-md shadow-inner">
          <MediPulseLogo className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-bold text-xl tracking-tight">MediPulse AI Chat</h2>
          <p className="text-xs text-teal-100 opacity-90 font-medium">Powered by Gemini 3 Pro • Medical Intelligence</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gradient-to-br from-teal-400 to-emerald-500'}`}>
                {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={20} className="text-white" />}
              </div>

              <div className="flex flex-col gap-2">
                <div className={`
                  p-4 md:p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm relative
                  ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'}
                `}>
                  {msg.isTyping && !msg.text ? (
                    <div className="flex space-x-1.5 h-6 items-center px-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div
                      className="markdown-content"
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                          .replace(/\n/g, '<br />') // Newlines
                      }}
                    />
                  )}
                </div>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-sm ml-2 animate-fade-in">
                    <p className="font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <RefreshCw size={10} /> Verified Sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-teal-600 dark:text-teal-400 transition-colors"
                        >
                          <span className="truncate max-w-[120px] font-medium">{source.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <span className={`text-[10px] text-slate-400 font-medium ${msg.role === 'user' ? 'text-right mr-1' : 'ml-1'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 relative z-20">
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1.5 transition-all focus-within:ring-2 focus-within:ring-teal-500/50 ring-offset-2 dark:ring-offset-slate-900 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your symptoms or health questions..."
            disabled={isProcessing}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 text-sm md:text-base placeholder-slate-400 h-full py-3 px-4"
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !inputText.trim()}
            className={`p-3 rounded-full transition-all duration-300 transform ${!inputText.trim()
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95'
              }`}
          >
            {isProcessing ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />}
          </button>
        </div>
      </div>

      <style>{`
        .markdown-content strong {
          font-weight: 700;
          color: inherit;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default AiChat;