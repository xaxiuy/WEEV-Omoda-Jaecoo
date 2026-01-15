import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { MessageCircle, Send, Loader2, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  metadata?: {
    actions?: Array<{
      type: string;
      url: string;
      label: string;
    }>;
  };
  createdAt: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }
      setUser(authUser);
      initChat();
    };
    getUser();
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initChat = async () => {
    try {
      setLoading(true);
      // Create a new thread
      const response = await api.post('/api/chat/threads');
      
      if (!response.ok) {
        console.error('Failed to create chat thread:', response.status);
        return;
      }
      
      const data = await response.json();
      setThreadId(data.threadId);
      
      // Load initial messages
      await loadMessages(data.threadId);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const response = await api.get(`/api/chat/threads/${id}`);
      
      if (!response.ok) {
        console.error('Failed to load messages:', response.status);
        return;
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    try {
      const response = await api.post(`/api/chat/threads/${threadId}/messages`, {
        content: userMessage
      });
      
      if (!response.ok) {
        console.error('Failed to send message:', response.status);
        setInput(userMessage); // Restore input on error
        return;
      }
      
      const data = await response.json();
      setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setInput(userMessage); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  const handleActionClick = async (action: { type: string; url: string; label: string }, refCode?: string) => {
    // Track click if refCode exists
    if (refCode) {
      try {
        await api.post(`/api/chat/actions/${refCode}/click`);
      } catch (error) {
        console.error('Failed to track action:', error);
      }
    }

    // Navigate to the URL
    window.location.href = action.url;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-[#65676B] mx-auto mb-4" />
          <p className="text-[#65676B]">Inicia sesión para usar el chat</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1877F2] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#050505]">Asistente Virtual</h1>
            <p className="text-sm text-[#65676B]">Omoda Jaecoo Uruguay</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.sender === 'user' ? (
                <div className="flex justify-end">
                  <div className="bg-[#1877F2] text-white rounded-2xl px-4 py-2 max-w-[80%]">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="space-y-2 max-w-[80%]">
                    <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
                      <p className="text-[#050505] whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    {message.metadata?.actions && message.metadata.actions.length > 0 && (
                      <div className="space-y-2">
                        {message.metadata.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleActionClick(action)}
                            className="flex items-center justify-between w-full bg-white border border-[#1877F2] text-[#1877F2] rounded-lg px-4 py-2 hover:bg-[#E7F3FF] transition-colors"
                          >
                            <span className="font-medium">{action.label}</span>
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={sending}
              className="flex-1 bg-[#F0F2F5] border-none rounded-full px-4 py-2 text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-[#1877F2] text-white p-2 rounded-full hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
