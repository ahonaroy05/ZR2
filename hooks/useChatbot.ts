import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  messages: ChatMessage[];
}

export function useChatbot() {
  const { user, isDemoMode } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistoryId, setChatHistoryId] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    // In demo mode, simulate AI response
    if (isDemoMode) {
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      // Simulate AI response delay
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: getDemoResponse(message),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
      }, 1500);
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/openai-chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          message: message.trim(),
          chat_history_id: chatHistoryId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.aiMessage,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update chat history ID for future messages
      if (data.chat_history_id && !chatHistoryId) {
        setChatHistoryId(data.chat_history_id);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode, chatHistoryId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatHistoryId(null);
    setError(null);
  }, []);

  const getDemoResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      return "I understand you're feeling stressed. Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, and exhale for 8. This can help activate your body's relaxation response during your commute.";
    }
    
    if (lowerMessage.includes('route') || lowerMessage.includes('traffic')) {
      return "For a more peaceful commute, try using our stress-optimized routes feature. It analyzes traffic patterns and suggests calmer paths. You can also enable nature sounds or guided meditation for heavy traffic situations.";
    }
    
    if (lowerMessage.includes('meditation') || lowerMessage.includes('mindful')) {
      return "Great choice! Start with our 5-minute breathing exercises during your commute. Focus on your breath and let the guided audio help you arrive at your destination feeling centered and calm.";
    }
    
    if (lowerMessage.includes('journal') || lowerMessage.includes('mood')) {
      return "Journaling is a wonderful way to process your commuting experiences. Try reflecting on one positive moment from your journey today, no matter how small. This helps build a more mindful relationship with travel.";
    }
    
    return "I'm here to help you create a more mindful and peaceful commuting experience. Whether you need stress management tips, route suggestions, or meditation guidance, I'm here to support your wellness journey. What would you like to explore?";
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
  };
}