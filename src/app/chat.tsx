import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { ChatService, ChatMessage } from '@/services/chatService';

function formatTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);

  const guideIdParam = params.guideId ? Number(params.guideId) : 1;
  const guideNameParam = (params.guideName as string) || 'Guia Zé';
  const guidePhoneParam = (params.guidePhone as string) || '(88) 99876-5432';

  const [guide, setGuide] = useState({
    id: guideIdParam,
    name: guideNameParam,
    role: (params.guideRole as string) || 'Guia Credenciado',
    is_online: true,
    phone: guidePhoneParam,
  });

  const [context, setContext] = useState({
    experience: 'Trilha Galinha Choca • Amanhã, 05:30',
    status: 'Confirmado',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadChat() {
      try {
        setLoading(true);
        const data = await ChatService.getMessages(guideIdParam);
        if (isMounted && data) {
          if (data.guide) setGuide((prev) => ({ ...prev, ...data.guide }));
          if (data.context) setContext(data.context);
          if (data.messages) setMessages(data.messages);
        }
      } catch (err) {
        console.warn('Erro ao carregar mensagens:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadChat();
    return () => {
      isMounted = false;
    };
  }, [guideIdParam]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    // 1. Mensagem otimista do usuário
    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      from: 'user',
      text,
      time: formatTime(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await ChatService.sendMessage(text, guide.id || guideIdParam);
      if (res) {
        // Atualiza a lista com o ID real e anexa a resposta inteligente do guia se houver
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== optimisticMsg.id);
          const next = [...filtered, res.userMessage];
          if (res.guideReply) {
            next.push(res.guideReply);
          }
          return next;
        });

        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }
    } catch (err) {
      console.warn('Erro ao enviar mensagem:', err);
    }
  };

  const handleCall = () => {
    Alert.alert(
      `Ligar para ${guide.name}`,
      `Deseja iniciar uma chamada de voz para o número ${guide.phone || '(88) 99876-5432'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Chamar',
          style: 'default',
          onPress: () => {
            Alert.alert('Chamada', `Conectando com ${guide.name}...`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff8f6" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={22} color={QuixaColors.onSurface} />
        </TouchableOpacity>

        {/* Avatar + Info */}
        <View style={styles.headerCenter}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={22} color="#8e4523" />
            </View>
            {guide.is_online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.guideName}>{guide.name}</Text>
              <Ionicons name="checkmark-circle" size={14} color={QuixaColors.primary} />
            </View>
            <Text style={styles.onlineLabel}>
              {guide.is_online ? 'Online agora' : 'Visto por último hoje'}
            </Text>
          </View>
        </View>

        {/* Call Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.callBtn}
          onPress={handleCall}
          accessibilityLabel="Ligar"
        >
          <Ionicons name="call-outline" size={20} color={QuixaColors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Context Banner ── */}
      <View style={styles.contextBanner}>
        <View style={styles.contextPill}>
          <Ionicons name="walk-outline" size={14} color="#783616" />
          <Text style={styles.contextText}>{context.experience}</Text>
          <View style={styles.confirmedBadge}>
            <Text style={styles.confirmedBadgeText}>{context.status}</Text>
          </View>
        </View>
      </View>

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesArea}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Date Divider */}
          <View style={styles.dateDivider}>
            <View style={styles.dateDividerLine} />
            <Text style={styles.dateDividerText}>Hoje</Text>
            <View style={styles.dateDividerLine} />
          </View>

          {messages.map((msg) => {
            const isUser = msg.from === 'user';
            return (
              <View
                key={msg.id}
                style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowGuide]}
              >
                {!isUser && (
                  <View style={styles.guideAvatarSmall}>
                    <Ionicons name="person" size={14} color="#8e4523" />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleGuide,
                  ]}
                >
                  <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                    {msg.text}
                  </Text>
                  <View style={styles.bubbleMeta}>
                    <Text style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
                      {msg.time}
                    </Text>
                    {isUser && (
                      <Ionicons
                        name={msg.read ? 'checkmark-done' : 'checkmark'}
                        size={13}
                        color={msg.read ? '#ffb598' : 'rgba(255,255,255,0.6)'}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mensagem..."
            placeholderTextColor="#b09b93"
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            accessibilityLabel="Enviar mensagem"
          >
            <Ionicons name="send" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff8f6',
  },

  /* Header */
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#fff8f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f5ded5',
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fae0d5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff8f6',
  },
  headerInfo: {
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guideName: {
    fontSize: 15,
    fontWeight: '700',
    color: QuixaColors.onSurface,
  },
  onlineLabel: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdeae5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Context Banner */
  contextBanner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff8f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f5ded5',
    alignItems: 'center',
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fdeae5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contextText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#783616',
  },
  confirmedBadge: {
    backgroundColor: '#8c3d17',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Messages */
  messagesArea: {
    flex: 1,
    backgroundColor: '#fdf5f2',
  },
  messagesContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 8,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dateDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8d5ce',
  },
  dateDividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9e7d74',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowGuide: {
    justifyContent: 'flex-start',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  guideAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fae0d5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  bubbleGuide: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleUser: {
    backgroundColor: QuixaColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: QuixaColors.onSurface,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#ffffff',
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
  },
  bubbleTime: {
    fontSize: 10,
    color: '#9e7d74',
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.65)',
  },

  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff8f6',
    borderTopWidth: 1,
    borderTopColor: '#f5ded5',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: '#fdeae5',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: QuixaColors.onSurface,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: QuixaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#d4b3a8',
    shadowOpacity: 0,
    elevation: 0,
  },
});
