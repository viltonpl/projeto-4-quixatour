import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { notify } from '@/components/ui/notify';
import { SessionStore } from '@/services/session';
import { PrestadorService, ProviderConversation } from '@/services/prestadorService';

const POLL_MS = 3000;

/** Conversa do prestador com um turista (o lado "guia" do chat). */
export default function PrestadorChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const touristId = Number(params.touristId);
  const scrollRef = useRef<any>(null);

  const [conv, setConv] = useState<ProviderConversation | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setConv(await PrestadorService.getConversation(touristId));
    } catch (err: any) {
      console.warn(err.message);
    }
  }, [touristId]);

  useEffect(() => {
    if (!SessionStore.guideId()) {
      router.replace('/');
      return;
    }
    load();
    const timer = setInterval(load, POLL_MS); // recebe mensagens novas do turista
    return () => clearInterval(timer);
  }, [load, router]);

  const handleSend = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    try {
      setSending(true);
      const msg = await PrestadorService.sendMessage(touristId, value);
      setConv((prev) => (prev ? { ...prev, messages: [...prev.messages, msg] } : prev));
    } catch (err: any) {
      setText(value);
      notify('Mensagem não enviada', err.message);
    } finally {
      setSending(false);
    }
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/prestador-mensagens'));
  const name = conv?.tourist.name || (params.touristName as string) || 'Turista';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={22} color={QuixaColors.onSurface} />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color="#8e4523" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.sub}>Turista</Text>
        </View>
      </View>

      {conv?.context && (
        <View style={styles.contextBanner}>
          <View style={styles.contextPill}>
            <Ionicons name="walk-outline" size={14} color="#783616" />
            <Text style={styles.contextText} numberOfLines={1}>
              {conv.context.experience}
            </Text>
            <View style={styles.contextBadge}>
              <Text style={styles.contextBadgeText}>{conv.context.status}</Text>
            </View>
          </View>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!conv ? (
          <View style={styles.center}>
            <ActivityIndicator color={QuixaColors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messages}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {conv.messages.map((m) => {
              const mine = m.from === 'guide';
              return (
                <View key={m.id} style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{m.text}</Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.time, mine && styles.timeMine]}>{m.time}</Text>
                      {mine && (
                        <Ionicons
                          name={m.read ? 'checkmark-done' : 'checkmark'}
                          size={14}
                          color="rgba(255,255,255,0.85)"
                        />
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={`Responder ${name}...`}
            placeholderTextColor={`${QuixaColors.secondary}a0`}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            accessibilityLabel="Enviar"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    height: 68,
    backgroundColor: QuixaColors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: QuixaColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: QuixaColors.onSurface },
  sub: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
  contextBanner: { paddingHorizontal: 16, paddingVertical: 8 },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: QuixaColors.surfaceContainer,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  contextText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#783616' },
  contextBadge: { backgroundColor: QuixaColors.secondaryContainer, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  contextBadgeText: { fontSize: 10, fontWeight: '700', color: QuixaColors.primary },
  messages: { padding: 16, gap: 8, width: '100%', maxWidth: 640, alignSelf: 'center' },
  bubbleRow: { flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMine: { backgroundColor: QuixaColors.primary, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: QuixaColors.surfaceContainerLowest, borderBottomLeftRadius: 6 },
  bubbleText: { fontSize: 14, color: QuixaColors.onSurface, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  time: { fontSize: 10, color: QuixaColors.onSurfaceVariant },
  timeMine: { color: 'rgba(255,255,255,0.8)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: QuixaColors.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 18,
    backgroundColor: QuixaColors.surfaceContainer,
    fontSize: 14,
    color: QuixaColors.onSurface,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
