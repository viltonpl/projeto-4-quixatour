import { SERVER_BASE_URL } from '@/services/api';

export const AppImages = {
  logo: require('../../assets/images/logo_app.png'),
  trilha: require('../../assets/images/fotos_display/trilha.png'),
  voo: require('../../assets/images/fotos_display/voo.png'),
  chale: require('../../assets/images/fotos_display/chale.png'),
};

/** Fotos prontas que o prestador pode escolher ao criar um passeio. */
export const PresetImageKeys = ['trilha', 'voo', 'chale'] as const;

/**
 * Converte o image_key salvo no banco em uma fonte de imagem:
 * - 'trilha' | 'voo' | 'chale' → fotos do app
 * - 'upload:<arquivo>'          → foto enviada pelo prestador (servida pelo backend em /uploads)
 * - http(s):// ou data:        → URL direta
 */
export function resolveImage(key?: string | null) {
  if (!key) return AppImages.trilha;
  if (key === 'trilha') return AppImages.trilha;
  if (key === 'voo') return AppImages.voo;
  if (key === 'chale') return AppImages.chale;
  if (key.startsWith('upload:')) return { uri: `${SERVER_BASE_URL}/uploads/${key.slice('upload:'.length)}` };
  if (key.startsWith('http') || key.startsWith('data:') || key.startsWith('blob:') || key.startsWith('file:')) {
    return { uri: key };
  }
  return AppImages.trilha;
}

export default AppImages;
