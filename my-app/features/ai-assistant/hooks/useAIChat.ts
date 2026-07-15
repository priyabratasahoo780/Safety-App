import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types/ai-assistant.types';
import { INITIAL_DEMO_CONVERSATION } from '../constants/assistant.constants';
import { sendMessageToAI } from '../services/aiAssistantService';

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_DEMO_CONVERSATION);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Use a ref to prevent duplicate sends
  const isRequestPending = useRef(false);

  const sendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isRequestPending.current) return;

    isRequestPending.current = true;
    setInputText('');
    setIsTyping(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Send to AI Service
      const response = await sendMessageToAI({
        message: trimmed,
        history: messages,
      });

      const assistantMsg: ChatMessage = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        status: 'sent',
      };

      // No local mode handling needed anymore

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      // Handle network error or failure
      const errorMsg: ChatMessage = {
        id: Date.now().toString() + '-err',
        role: 'assistant',
        content: 'I am currently unable to connect. Please check your network or try again.',
        timestamp: Date.now(),
        status: 'sent', // from our perspective, the error message is successfully displayed
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
      isRequestPending.current = false;
    }
  }, [inputText, messages]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    isTyping,
    sendMessage,
    clearConversation,
  };
}
