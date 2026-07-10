import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, KeyboardAvoidingView, Platform, 
  TouchableOpacity, Modal, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, History, MoreVertical } from 'lucide-react-native';

import { useAIChat } from '../hooks/useAIChat';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { AssistantProfileCard } from '../components/AssistantProfileCard';
import { QuickActionChips } from '../components/QuickActionChips';
import { ASSISTANT_NAME } from '../constants/assistant.constants';

export function AIAssistantScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const { 
    messages, inputText, setInputText, isTyping, 
    sendMessage, clearConversation, isLocalMode 
  } = useAIChat();

  const [isMoreModalVisible, setIsMoreModalVisible] = useState(false);

  const handleSend = () => {
    sendMessage();
  };

  const handleQuickActionPrompt = (prompt: string) => {
    setInputText(prompt);
    // Give a slight delay so user sees the input update before sending
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const handleClearConversation = () => {
    setIsMoreModalVisible(false);
    Alert.alert(
      'Clear conversation?',
      'This will remove your current chat messages from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearConversation }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#10153A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{ASSISTANT_NAME}</Text>
          <Text style={styles.headerSubtitle}>Your smart safety companion</Text>
        </View>

        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => Alert.alert('Chat History', 'Chat history will be available soon.')}
          accessibilityRole="button"
          accessibilityLabel="Chat history"
        >
          <History size={22} color="#10153A" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => setIsMoreModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MoreVertical size={22} color="#10153A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <AssistantProfileCard isLocalMode={isLocalMode} />
              <View style={styles.todayDivider}>
                <View style={styles.todayBadge}>
                  <Text style={styles.todayText}>Today</Text>
                </View>
              </View>
            </>
          }
          ListFooterComponent={isTyping ? <TypingIndicator /> : <View style={{ height: 10 }} />}
          renderItem={({ item }) => <ChatMessageBubble message={item} />}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          keyboardShouldPersistTaps="handled"
        />

        <QuickActionChips 
          onSelectPrompt={handleQuickActionPrompt}
          onOpenMore={() => setIsMoreModalVisible(true)}
        />
        
        <ChatInput 
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          isLoading={isTyping}
        />
      </KeyboardAvoidingView>

      {/* More Options Modal */}
      <Modal
        visible={isMoreModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMoreModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMoreModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalItem} onPress={handleClearConversation}>
              <Text style={[styles.modalItemText, { color: '#F04438' }]}>Clear Conversation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalItem} 
              onPress={() => {
                setIsMoreModalVisible(false);
                Alert.alert('About Ananya AI', 'Ananya AI provides general safety guidance and may make mistakes. In an immediate emergency, use the SOS feature or contact the appropriate local emergency service.');
              }}
            >
              <Text style={styles.modalItemText}>About Ananya AI</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem} onPress={() => setIsMoreModalVisible(false)}>
              <Text style={styles.modalItemText}>Privacy Information</Text>
            </TouchableOpacity>

            <View style={styles.modalDivider} />

            <TouchableOpacity style={styles.modalItem} onPress={() => setIsMoreModalVisible(false)}>
              <Text style={[styles.modalItemText, { fontWeight: '700' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: 12,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10153A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#596080',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFD',
  },
  listContent: {
    paddingBottom: 20,
  },
  todayDivider: {
    alignItems: 'center',
    marginVertical: 12,
  },
  todayBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    fontSize: 11,
    color: '#596080',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalItem: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#10153A',
    fontWeight: '500',
  },
  modalDivider: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
});
