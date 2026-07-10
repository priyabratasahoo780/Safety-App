import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { sendMessageToAI } from '../../features/ai-assistant/services/aiAssistantService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AssistantScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hi Ananya! I am SafeSphere AI, your intelligent personal safety companion. Ask me about legal rights, local safety tips, or how to navigate safely tonight.",
      timestamp: '10:05 AM'
    },
    {
      id: '2',
      sender: 'user',
      text: "What should I do if I feel like I'm being followed?",
      timestamp: '10:06 AM'
    },
    {
      id: '3',
      sender: 'ai',
      text: "If you feel followed:\n\n1. Head towards a public, well-lit place immediately (a shop, restaurant, or metro station).\n2. Open your Home dashboard and tap 'Fake Call' to deter them with a loud conversation.\n3. Share your live tracking URL with a trusted contact.\n4. Call emergency services or prepare to trigger your SOS alarm if they persist.",
      timestamp: '10:06 AM'
    }
  ]);


  const handleSend = async () => {
    if (!inputText.trim()) return;

    const currentText = inputText.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Map existing messages to the format expected by the service
      const history = messages.map(msg => ({
        id: msg.id,
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text,
        timestamp: Date.now(),
        status: 'sent' as any
      }));

      const response = await sendMessageToAI({
        message: currentText,
        history: history as any
      });

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I am having trouble connecting right now.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.aiIconWrapper}>
            <MaterialCommunityIcons name="robot" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>SafeSphere AI</Text>
            <Text style={styles.headerStatus}>Online • Powered by Gemini</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.infoBtn}>
          <Feather name="info" size={18} color="#4B5563" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages Feed */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesScroll}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <View key={msg.id} style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
                {!isUser && (
                  <View style={styles.bubbleAvatar}>
                    <MaterialCommunityIcons name="robot" size={14} color="#6D28D9" />
                  </View>
                )}
                
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>
                    {msg.text}
                  </Text>
                  <Text style={[styles.bubbleTimestamp, isUser ? styles.userTime : styles.aiTime]}>
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.bubbleAvatar}>
                <MaterialCommunityIcons name="robot" size={14} color="#6D28D9" />
              </View>
              <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, { marginHorizontal: 3 }]} />
                <View style={styles.typingDot} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Text Box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask SafeSphere AI anything..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.disabledSendBtn]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  aiIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerStatus: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  infoBtn: {
    padding: 8,
  },
  messagesScroll: {
    padding: 20,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#6D28D9',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#1F2937',
  },
  bubbleTimestamp: {
    fontSize: 9,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: '#E9D5FF',
  },
  aiTime: {
    color: '#9CA3AF',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6D28D9',
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendBtn: {
    backgroundColor: '#E5E7EB',
  },
});

