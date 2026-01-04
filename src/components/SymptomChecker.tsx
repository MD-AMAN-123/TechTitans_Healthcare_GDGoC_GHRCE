import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, ExternalLink } from 'lucide-react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

const SymptomChecker: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi, I'm the MediPulse AI Assistant. Describe your symptoms, and I'll help analyze them using our ML Kit-powered engine.",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

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
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-4 flex items-center gap-3 text-white shadow-md z-10">
        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg">AI Symptom Checker</h2>
          <p className="text-xs text-teal-100 opacity-90">Powered by Google ML Kit & Gemini</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-teal-500'}`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
              </div>
              
              <div className="flex flex-col gap-2">
                <div className={`
                  p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'}
                `}>
                  {msg.isTyping && !msg.text ? (
                    <div className="flex space-x-1 h-5 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                  )}
                </div>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-sm ml-2">
                    <p className="font-semibold text-slate-500 dark:text-slate-400 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-teal-600 dark:text-teal-400 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{source.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full pr-2 pl-4 py-2 transition-all focus-within:ring-2 focus-within:ring-teal-500 ring-offset-1 dark:ring-offset-slate-900">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe your symptoms..."
            disabled={isProcessing}
            className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 text-sm placeholder-slate-400 h-full py-2"
          />
          <button 
            onClick={handleSendMessage}
            disabled={isProcessing || !inputText.trim()}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              !inputText.trim() 
                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 hover:bg-teal-700'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;