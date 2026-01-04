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
      text: "Hello! 👋 I'm MediPulse, your personal health assistant. I'm here to listen to your symptoms, answer your health questions, and help you feel better. How are you feeling today?",
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

  const handleSendMessage = async () => {
    // 1. Check strict lock via ref (prevent double clicks)
    if (!inputText.trim() || isProcessingRef.current) return;

    // 2. Check Rate Limit (8 seconds)
    const now = Date.now();
    const RATE_LIMIT = 8000;
    const timeSinceLastRequest = now - lastRequestTimeRef.current;

    if (timeSinceLastRequest < RATE_LIMIT) {
      const remaining = Math.ceil((RATE_LIMIT - timeSinceLastRequest) / 1000);
      
      // Add a local system message warning
      const warningMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: `⏳ **Please wait ${remaining} seconds** before sending another message to ensure the best analysis.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, warningMsg]);
      return;
    }

    // Acquire locks and update timestamps
    isProcessingRef.current = true;
    lastRequestTimeRef.current = now;
    setIsProcessing(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Placeholder for streaming message
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      timestamp: new Date(),
      isTyping: true
    }]);

    try {
      const stream = await sendMessageToGemini(userMsg.text);
      let fullText = '';
      let allSources: { title: string; uri: string }[] = [];
      
      for await (const chunk of stream) {
        if (chunk.text) {
          fullText += chunk.text;
        }
        if (chunk.sources) {
          allSources = [...allSources, ...chunk.sources];
          // Deduplicate sources based on URI
          allSources = Array.from(new Map(allSources.map(s => [s.uri, s])).values());
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: fullText, isTyping: false, sources: allSources.length > 0 ? allSources : undefined } 
              : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Chat error", error);
      
      let errorMessage = "I apologize, but I encountered an unexpected error. Please try again.";

      // Attempt to identify the error type for a friendlier message
      const errStr = error?.message || String(error);
      
      if (errStr.includes("429") || errStr.includes("quota")) {
        errorMessage = "⚠️ **System Busy**: I'm currently receiving a high volume of requests. Please wait a moment and try asking again.";
      } else if (errStr.includes("network") || errStr.includes("fetch")) {
        errorMessage = "⚠️ **Connection Issue**: Please check your internet connection and try again.";
      } else if (errStr.includes("API Key")) {
        errorMessage = "⚠️ **Configuration Error**: There seems to be an issue with the system configuration (API Key).";
      }

      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: errorMessage, isTyping: false }
          : msg
      ));
    } finally {
      isProcessingRef.current = false; // Release lock
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
            className={`p-3 rounded-full transition-all duration-300 transform ${
              !inputText.trim() 
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