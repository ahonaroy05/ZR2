import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { useChatbot, ChatMessage } from '@/hooks/useChatbot';
import { X, Send, Bot, User, Trash2, MessageCircle, Loader as Loader2 } from 'lucide-react-native';

interface AiAssistantChatProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function AiAssistantChat({ visible, onClose }: AiAssistantChatProps) {
  const { colors, theme } = useTheme();
  const { messages, loading, error, sendMessage, clearChat } = useChatbot();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    
    const messageToSend = inputText.trim();
    setInputText('');
    await sendMessage(messageToSend);
  };

  const handleClearChat = () => {
    clearChat();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <View key={index} style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        <View style={styles.messageHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: isUser ? colors.primary : colors.accent }]}>
            {isUser ? (
              <User size={16} color={colors.textInverse} />
            ) : (
              <Bot size={16} color={colors.textInverse} />
            )}
          </View>
          <Text style={[styles.messageTime, { color: colors.textSecondary }]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
        
        <View style={[
          styles.messageBubble,
          { backgroundColor: isUser ? colors.primary : colors.card },
          { shadowColor: colors.shadow }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? colors.textInverse : colors.text }
          ]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={styles.overlay}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.chatContainer, { backgroundColor: colors.background }]}>
            {/* Header */}
            <LinearGradient
              colors={theme.gradient.primary}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={[styles.headerIcon, { backgroundColor: colors.surface }]}>
                    <Bot size={24} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
                      ZenRoute Assistant
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textInverse }]}>
                      Your mindful commuting companion
                    </Text>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  {messages.length > 0 && (
                    <TouchableOpacity
                      style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                      onPress={handleClearChat}
                    >
                      <Trash2 size={18} color={colors.textInverse} />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.headerButton, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}
                    onPress={onClose}
                  >
                    <X size={18} color={colors.textInverse} />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
                    <MessageCircle size={32} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>
                    Welcome to ZenRoute Assistant
                  </Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    I'm here to help you with stress management, mindful commuting, and wellness tips. 
                    Ask me anything about your journey to inner peace!
                  </Text>
                  
                  <View style={styles.suggestedQuestions}>
                    <Text style={[styles.suggestedTitle, { color: colors.text }]}>Try asking:</Text>
                    {[
                      "How can I reduce stress during my commute?",
                      "What meditation exercises work best in traffic?",
                      "Help me find a peaceful route to work"
                    ].map((question, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.suggestionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setInputText(question)}
                      >
                        <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                          "{question}"
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                messages.map((message, index) => renderMessage(message, index))
              )}
              
              {loading && (
                <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                  <View style={styles.messageHeader}>
                    <View style={[styles.avatarContainer, { backgroundColor: colors.accent }]}>
                      <Bot size={16} color={colors.textInverse} />
                    </View>
                  </View>
                  
                  <View style={[
                    styles.messageBubble,
                    styles.loadingBubble,
                    { backgroundColor: colors.card, shadowColor: colors.shadow }
                  ]}>
                    <View style={styles.loadingContent}>
                      <Loader2 size={16} color={colors.primary} />
                      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Thinking...
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Error Display */}
            {error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
                <Text style={[styles.errorText, { color: colors.textInverse }]}>
                  {error}
                </Text>
              </View>
            )}

            {/* Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Ask me about mindful commuting..."
                  placeholderTextColor={colors.textSecondary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSend}
                  blurOnSubmit={false}
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { opacity: (!inputText.trim() || loading) ? 0.5 : 1 }
                  ]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || loading}
                >
                  <LinearGradient
                    colors={theme.gradient.primary}
                    style={styles.sendGradient}
                  >
                    <Send size={18} color={colors.textInverse} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chatContainer: {
    height: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  headerSubtitle: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestedQuestions: {
    width: '100%',
  },
  suggestedTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    marginBottom: 12,
  },
  suggestionButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    fontStyle: 'italic',
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageTime: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 11,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingBubble: {
    minWidth: 80,
  },
  messageText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});