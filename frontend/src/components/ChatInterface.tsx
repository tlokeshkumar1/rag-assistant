import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  files: File[];
  uploadedFiles?: string[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ files, uploadedFiles = [] }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your RAG assistant. You can chat with me about any topic, and if you\'ve uploaded files, I can help you analyze and discuss their contents.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // RAG response using backend API
  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('query', userMessage);

      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      return data.answer || 'Sorry, I could not generate a response.';
      
    } catch (error) {
      console.error('Error calling RAG API:', error);
      
      // Fallback response if API fails
      if (uploadedFiles.length > 0) {
        return `I apologize, but I'm having trouble connecting to the analysis service. However, I can see you've uploaded ${uploadedFiles.length} file(s): ${uploadedFiles.join(', ')}. Please try your question again in a moment.`;
      } else {
        return `I apologize, but I'm having trouble connecting to the service right now. Please try again in a moment. If you'd like me to analyze specific documents, please upload them first.`;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await generateResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 max-h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">RAG Assistant</h2>
            <p className="text-sm text-gray-600">
              {uploadedFiles.length > 0 
                ? `${uploadedFiles.length} file(s) uploaded and ready` 
                : files.length > 0 
                ? `${files.length} file(s) selected - upload to analyze`
                : 'Ready to help'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[calc(100vh-20rem)]">{/* <-- Added your improved max-height constraint */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            
            <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
              message.type === 'user' ? 'order-1' : 'order-2'
            }`}>
              <div className={`p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className={`whitespace-pre-wrap ${
                  message.type === 'user' ? '' : 'bg-gray-50 rounded-lg p-4'
                }`}>
                  {message.type === 'assistant' ? (
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: message.content
                          .split('\n')
                          .map(line => {
                            if (line.startsWith('HEADING:')) {
                              return `<div class="font-bold text-gray-900 mb-0 mt-2 first:mt-0">${line.replace('HEADING:', '').trim()}</div>`;
                            }
                            return line;
                          })
                          .join('<br/>')
                      }}
                    />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
              <p className={`text-xs text-gray-500 mt-1 ${
                message.type === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 order-2">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="bg-gray-100 p-3 rounded-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent max-h-32"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};