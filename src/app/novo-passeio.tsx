import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { PresetImageKeys, resolveImage } from '@/constants/images';
import { notify } from '@/components/ui/notify';
import { SessionStore } from '@/services/session';
import { ExperienceForm, PrestadorService } from '@/services/prestadorService';

const DEFAULT_CATEGORIES = ['Trilhas', 'Aventuras', 'Hospedagens', 'Restaurantes', 'Comidas', 'Lazeres'];
const PRESET_LABELS: Record<string, string> = { trilha: 'Trilha', voo: 'Voo', chale: 'Chalé' };

/** Níveis da trilha ('' = não se aplica, ex.: restaurante ou hospedagem). */
const LEVELS: { key: ExperienceForm['level']; label: string; color: string; hint: string }[] = [
  { key: 'leve', label: 'Leve', color: '#2e7d32', hint: 'Caminhada tranquila, para todas as idades' },
  { key: 'moderado', label: 'Moderado', color: '#b26a00', hint: 'Exige algum preparo físico e subidas' },
  { key: 'dificil', label: 'Difícil', color: '#ba1a1a', hint: 'Terreno exigente, para quem tem experiência' },
  { key: '', label: 'Não se aplica', color: '#8a7269', hint: 'Restaurantes, hospedagens e passeios sem esforço' },
];

const EMPTY_FORM: ExperienceForm = {
  title: '',
  category_name: 'Trilhas',
  price: '',
  meeting_point: '',
  description: '',
  duration: '',
  inclusions: [],
  image_key: 'trilha',
  level: 'moderado',
};

export default function NovoPasseioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.id ? Number(params.id) : undefined;

  const [form, setForm] = useState<ExperienceForm>(EMPTY_FORM);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(Boolean(editId));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!SessionStore.guideId()) {
      router.replace('/');
      return;
    }
    PrestadorService.getCategories().then(setCategories).catch(() => {});
    PrestadorService.getInclusionSuggestions().then(setSuggestedTags).catch(() => {});

    if (editId) {
      PrestadorService.getExperience(editId)
        .then((exp) =>
          setForm({
            title: exp.title,
            category_name: exp.category_name,
            price: String(exp.price).replace('.', ','),
            meeting_point: exp.meeting_point,
            description: exp.description,
            duration: exp.duration,
            inclusions: exp.inclusions || [],
            image_key: exp.image_key,
            level: exp.level || '',
          })
        )
        .catch((err) => notify('Erro', err.message))
        .finally(() => setLoading(false));
    }
  }, [editId, router]);

  const update = (key: keyof ExperienceForm, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  // ---- Tags de "O que está incluído" ----
  const hasTag = (tag: string) => form.inclusions.some((t) => t.toLowerCase() === tag.toLowerCase());

  const toggleTag = (tag: string) =>
    setForm((prev) => ({
      ...prev,
      inclusions: hasTag(tag)
        ? prev.inclusions.filter((t) => t.toLowerCase() !== tag.toLowerCase())
        : [...prev.inclusions, tag],
    }));

  const addCustomTag = () => {
    const tag = newTag.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!tag) return;
    if (!hasTag(tag)) setForm((prev) => ({ ...prev, inclusions: [...prev.inclusions, tag] }));
    if (!suggestedTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setSuggestedTags((prev) => [...prev, tag]);
    }
    setNewTag('');
  };

  const availableTags = suggestedTags.filter((t) => !hasTag(t));

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/prestador'));

  const handlePickPhoto = async () => {
    try {
      setUploading(true);
      const file = await PrestadorService.pickAndUpload('library');
      if (file) update('image_key', file.uri);
    } catch (err: any) {
      notify('Erro ao enviar foto', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await PrestadorService.saveExperience(form, editId);
      notify(
        editId ? 'Passeio atualizado!' : 'Passeio publicado!',
        editId
          ? 'As alterações já aparecem para os turistas.'
          : 'Seu passeio já aparece na tela Explorar dos turistas.'
      );
      router.replace('/prestador');
    } catch (err: any) {
      notify('Confira os dados', err.message);
    } finally {
      setSaving(false);
    }
  };

  const isUpload = form.image_key.startsWith('upload:');

  const inputStyle = (name: string) => [styles.input, focused === name && styles.inputFocused];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={goBack} accessibilityLabel="Voltar">
          <Ionicons name="arrow-back" size={24} color={QuixaColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editId ? 'Editar Passeio' : 'Novo Passeio'}</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={QuixaColors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {/* Foto */}
            <Text style={styles.label}>Foto do Passeio</Text>
            <TouchableOpacity style={styles.photoBox} activeOpacity={0.9} onPress={handlePickPhoto} disabled={uploading}>
              <Image source={resolveImage(form.image_key)} style={styles.photo} resizeMode="cover" />
              <View style={styles.photoCaption}>
                <Text style={styles.photoCaptionText} numberOfLines={1}>
                  {uploading ? 'Enviando foto...' : isUpload ? 'Foto enviada por você' : 'Toque para enviar sua foto'}
                </Text>
                {uploading ? (
                  <ActivityIndicator size="small" color={QuixaColors.primary} />
                ) : (
                  <Ionicons
                    name={isUpload ? 'checkmark-circle' : 'camera-outline'}
                    size={20}
                    color={QuixaColors.primary}
                  />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.chipsRow}>
              <Text style={styles.helper}>ou use uma foto pronta:</Text>
              {PresetImageKeys.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.chip, form.image_key === key && styles.chipActive]}
                  onPress={() => update('image_key', key)}
                >
                  <Text style={[styles.chipText, form.image_key === key && styles.chipTextActive]}>
                    {PRESET_LABELS[key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nome */}
            <FieldLabel icon="walk-outline" text="Nome do Passeio" />
            <TextInput
              style={inputStyle('title')}
              value={form.title}
              onChangeText={(v) => update('title', v)}
              placeholder="Trilha da Pedra do Cruzeiro ao Entardecer"
              placeholderTextColor={`${QuixaColors.secondary}90`}
              onFocus={() => setFocused('title')}
              onBlur={() => setFocused(null)}
            />

            {/* Categoria */}
            <FieldLabel icon="pricetags-outline" text="Categoria" />
            <View style={styles.chipsRow}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, form.category_name === cat && styles.chipActive]}
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      category_name: cat,
                      // Trilhas/Aventuras sugerem um nível; gastronomia e hospedagem não têm nível
                      level: ['Trilhas', 'Aventuras'].includes(cat)
                        ? prev.level || 'moderado'
                        : ['Hospedagens', 'Restaurantes', 'Comidas'].includes(cat)
                          ? ''
                          : prev.level,
                    }))
                  }
                >
                  <Text style={[styles.chipText, form.category_name === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nível da trilha */}
            <FieldLabel icon="trending-up-outline" text="Nível da trilha" />
            <View style={styles.levelsGrid}>
              {LEVELS.map((lvl) => {
                const active = form.level === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.label}
                    style={[styles.levelCard, active && { borderColor: lvl.color, backgroundColor: '#fff' }]}
                    onPress={() => update('level', lvl.key)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.levelHeader}>
                      <View style={[styles.levelDot, { backgroundColor: lvl.color }]} />
                      <Text style={[styles.levelLabel, active && { color: lvl.color }]}>{lvl.label}</Text>
                      {active && <Ionicons name="checkmark-circle" size={18} color={lvl.color} />}
                    </View>
                    <Text style={styles.levelHint}>{lvl.hint}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Preço */}
            <FieldLabel
              icon="cash-outline"
              text={form.category_name === 'Hospedagens' ? 'Preço por noite (R$)' : 'Preço por pessoa (R$)'}
            />
            <View style={[styles.input, styles.priceRow, focused === 'price' && styles.inputFocused]}>
              <Text style={styles.currency}>R$</Text>
              <TextInput
                style={styles.priceInput}
                value={form.price}
                onChangeText={(v) => update('price', v.replace(/[^0-9,.]/g, ''))}
                placeholder="60"
                placeholderTextColor={`${QuixaColors.secondary}90`}
                keyboardType="decimal-pad"
                onFocus={() => setFocused('price')}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Ponto de encontro */}
            <FieldLabel icon="location-outline" text="Ponto de Encontro" />
            <TextInput
              style={inputStyle('meeting')}
              value={form.meeting_point}
              onChangeText={(v) => update('meeting_point', v)}
              placeholder="Praça da Estação Ferroviária de Quixadá"
              placeholderTextColor={`${QuixaColors.secondary}90`}
              onFocus={() => setFocused('meeting')}
              onBlur={() => setFocused(null)}
            />

            {/* Duração */}
            <FieldLabel icon="time-outline" text="Duração (opcional)" />
            <TextInput
              style={inputStyle('duration')}
              value={form.duration}
              onChangeText={(v) => update('duration', v)}
              placeholder="2h30"
              placeholderTextColor={`${QuixaColors.secondary}90`}
              onFocus={() => setFocused('duration')}
              onBlur={() => setFocused(null)}
            />

            {/* Descrição */}
            <FieldLabel icon="document-text-outline" text="Descrição e Informações" />
            <TextInput
              style={[...inputStyle('description'), styles.textArea]}
              value={form.description}
              onChangeText={(v) => update('description', v)}
              placeholder="Conte o que o turista vai ver, o nível de dificuldade e o que precisa levar."
              placeholderTextColor={`${QuixaColors.secondary}90`}
              multiline
              textAlignVertical="top"
              onFocus={() => setFocused('description')}
              onBlur={() => setFocused(null)}
            />

            {/* Inclusos: tags prontas + criar novas */}
            <FieldLabel icon="checkmark-done-outline" text="O que está incluído" />

            {form.inclusions.length > 0 ? (
              <View style={styles.chipsRow}>
                {form.inclusions.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, styles.tagChipSelected]}
                    onPress={() => toggleTag(tag)}
                    accessibilityLabel={`Remover ${tag}`}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#fff" />
                    <Text style={styles.tagChipTextSelected}>{tag}</Text>
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.helper}>Toque nas tags abaixo para incluir no seu passeio.</Text>
            )}

            <View style={styles.tagCreateRow}>
              <TextInput
                style={[...inputStyle('newTag'), styles.tagInput]}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Criar nova tag (ex.: Café da manhã)"
                placeholderTextColor={`${QuixaColors.secondary}90`}
                onSubmitEditing={addCustomTag}
                returnKeyType="done"
                maxLength={40}
                onFocus={() => setFocused('newTag')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity
                style={[styles.tagAddBtn, !newTag.trim() && { opacity: 0.5 }]}
                onPress={addCustomTag}
                disabled={!newTag.trim()}
                accessibilityLabel="Adicionar tag"
              >
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {availableTags.length > 0 && (
              <>
                <Text style={styles.helper}>Tags prontas:</Text>
                <View style={styles.chipsRow}>
                  {availableTags.map((tag) => (
                    <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => toggleTag(tag)}>
                      <Ionicons name="add" size={14} color={QuixaColors.primary} />
                      <Text style={styles.tagChipText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, (saving || uploading) && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={saving || uploading}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              )}
              <Text style={styles.submitText}>{editId ? 'Salvar Alterações' : 'Publicar Passeio'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function FieldLabel({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.fieldLabel}>
      <Ionicons name={icon} size={18} color={QuixaColors.primary} />
      <Text style={styles.label}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: QuixaColors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 64,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: QuixaColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    zIndex: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: QuixaColors.onSurface },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 40, gap: 10, width: '100%', maxWidth: 520, alignSelf: 'center' },
  label: { fontSize: 14, fontWeight: '700', color: QuixaColors.onSurface },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  helper: { fontSize: 12, color: QuixaColors.onSurfaceVariant },
  photoBox: {
    height: 190,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: QuixaColors.surfaceContainerHigh,
    borderWidth: 4,
    borderColor: QuixaColors.surfaceContainerHigh,
    marginTop: 4,
  },
  photo: { width: '100%', height: '100%' },
  photoCaption: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,248,246,0.95)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  photoCaptionText: { fontSize: 12, fontWeight: '700', color: QuixaColors.onSurface, flex: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: QuixaColors.surfaceContainer,
  },
  chipActive: { backgroundColor: QuixaColors.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  chipTextActive: { color: '#fff' },
  input: {
    minHeight: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    backgroundColor: '#ffdbcc',
    fontSize: 16,
    color: QuixaColors.onSurface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: { borderColor: QuixaColors.primaryContainer },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { fontSize: 18, fontWeight: '700', color: QuixaColors.primary },
  priceInput: { flex: 1, fontSize: 22, fontWeight: '700', color: QuixaColors.onSurface, height: 52 },
  textArea: { minHeight: 120, borderRadius: 24, paddingTop: 16, paddingBottom: 16 },
  levelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelCard: {
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: 20,
    padding: 12,
    gap: 4,
    backgroundColor: QuixaColors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelDot: { width: 10, height: 10, borderRadius: 5 },
  levelLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: QuixaColors.onSurface },
  levelHint: { fontSize: 11, color: QuixaColors.onSurfaceVariant, lineHeight: 15 },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: QuixaColors.surfaceContainer,
    borderWidth: 1,
    borderColor: QuixaColors.outlineVariant,
  },
  tagChipSelected: { backgroundColor: QuixaColors.primary, borderColor: QuixaColors.primary },
  tagChipText: { fontSize: 12, fontWeight: '600', color: QuixaColors.onSurfaceVariant },
  tagChipTextSelected: { fontSize: 12, fontWeight: '700', color: '#fff' },
  tagCreateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagInput: { flex: 1, minHeight: 48, fontSize: 14 },
  tagAddBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: QuixaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: QuixaColors.background,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  submitBtn: {
    height: 56,
    borderRadius: 999,
    backgroundColor: QuixaColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
