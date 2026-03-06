// @ts-nocheck
"use client";

import { useChat } from '@ai-sdk/react';
import { Search, ArrowRight, Loader2, Database } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const hasMessages = messages.length > 0;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  return (
    <main className="flex min-h-screen flex-col font-sans">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md sticky top-0 z-10 transition-colors">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold tracking-tight text-lg">Enterprise Search</span>
        </div>
      </header>

      <div className={`flex flex-col items-center justify-center p-4 transition-all duration-700 w-full flex-1 ${hasMessages ? 'justify-start pt-8 pb-32' : ''}`}>
        
        {!hasMessages && (
          <div className="w-full max-w-2xl text-center space-y-6 fade-in flex flex-col items-center justify-center mt-[-10vh]">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-500 dark:from-gray-100 dark:to-gray-500 pb-2">
              What do you want to know?
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Search across internal Jira specs, Confluence documentation, and company knowledge using natural language.
            </p>
          </div>
        )}

        {hasMessages && (
          <div className="w-full max-w-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {messages.map((m) => (
              <div key={m.id} className="flex flex-col">
                {m.role === 'user' ? (
                  <h2 className="text-2xl font-semibold mb-2 text-black dark:text-white">
                    {typeof m.content === 'string' ? m.content : m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')}
                  </h2>
                ) : (
                  <div className="markdown-content text-gray-800 dark:text-gray-200">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {typeof m.content === 'string' ? m.content : m.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
               <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span className="font-medium">Searching Confluence & Jira, summarizing results...</span>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={`w-full max-w-3xl px-4 transition-all duration-500 z-20 ${hasMessages ? 'fixed bottom-8' : 'mt-8'}`}>
          <form onSubmit={handleSubmit} className="relative flex items-center shadow-xl dark:shadow-2xl dark:shadow-black/50 overflow-hidden bg-white dark:bg-[#1C1C1C] rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
            <Search className="absolute left-6 text-gray-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              className="w-full py-5 pl-14 pr-16 bg-transparent outline-none text-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              disabled={!input?.trim() || isLoading}
              className="absolute right-3 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 dark:disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center transform active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          
          {!hasMessages && (
             <div className="mt-8 flex flex-wrap justify-center gap-3">
               {[
                  "Where is the V2.0 login API documentation?", 
                  "Explain the V2.0 Authentication Architecture", 
                  "What was the fix for the recent login issue?"
               ].map((suggestion) => (
                 <button 
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-gray-100/80 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 text-sm rounded-full text-gray-700 dark:text-gray-300 transition-all cursor-pointer border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                 >
                   {suggestion}
                 </button>
               ))}
             </div>
          )}
        </div>

      </div>
    </main>
  );
}
