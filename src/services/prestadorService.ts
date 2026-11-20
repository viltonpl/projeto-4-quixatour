import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from './api';
import { SessionStore } from './session';

export interface TouristRequest {
  id: number;
  reservation_code: string;
  tourist_id: number;
  tourist_name: string;
  title: string;
  schedule_text: string;
  participants: number;
  total: number;
  formatted_total: string;
  payment_method: 'pix' | 'credit';
  status: string;
}

export interface ProviderExperience {
  id: number;
  title: string;
  price: number;
  price_label: string;
  image_key: string;
  category_name: string;
  is_active: boolean;
  bookings_count: number;
}

export interface ProviderDashboard {
  guide: {
    id: number;
    name: string;
    role: string;
    cadastur?: string;
    cadastur_status: 'nao_enviado' | 'rascunho' | 'em_analise' | 'aprovado';
    is_verified: boolean;
    rating: number;
  };
  balance: {
    available: number;
    formatted: string;
    to_receive: number;
    formatted_to_receive: string;
  };
  pending: TouristRequest[];
  agenda: TouristRequest[];
  experiences: ProviderExperience[];
  unread_messages: number;
}

export interface ExperienceForm {
  title: string;
  category_name: string;
  price: string;
  meeting_point: string;
  description: string;
  duration?: string;
  /** Tags de "O que está incluído" */
  inclusions: string[];
  image_key: string;
  /** Nível da trilha: 'leve' | 'moderado' | 'dificil' | '' (não se aplica) */
  level: '' | 'leve' | 'moderado' | 'dificil';
}

export interface UploadedFile {
  uri: string; // chave 'upload:<arquivo>'
  name: string;
  size: string;
}

export interface CadasturData {
  status: 'rascunho' | 'em_analise' | 'aprovado';
  guide_cadastur?: string;
  submitted_at?: string | null;
  steps_done: number;
  progress: number;
  doc_front: UploadedFile | null;
  doc_back: UploadedFile | null;
  cadastur_number: string;
  credential_file: UploadedFile | null;
  selfie: UploadedFile | null;
  ethics_accepted: boolean;
}

export interface Conversation {
  tourist_id: number;
  tourist_name: string;
  last_text: string;
  last_time: string;
  unread: number;
}

export interface ProviderChatMessage {
  id: string;
  from: 'guide' | 'user';
  text: string;
  time: string;
  read?: boolean;
}

export interface ProviderConversation {
  tourist: { id: number; name: string; phone?: string };
  context: { experience: string; status: string } | null;
  messages: ProviderChatMessage[];
}

async function uriToDataUri(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem escolhida.'));
    reader.readAsDataURL(blob);
  });
}

function requireGuideId(): number {
  const id = SessionStore.guideId();
  if (!id) throw new Error('Entre com uma conta de prestador para acessar o painel.');
  return id;
}

/** Desembrulha { success, data } ou lança o erro do servidor. */
async function unwrap<T>(promise: Promise<any>): Promise<T> {
  let res: any;
  try {
    res = await promise;
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando (npm run backend).');
  }
  if (!res?.success) throw new Error(res?.message || 'Erro ao processar a solicitação.');
  return res.data as T;
}

export class PrestadorService {
  static getDashboard() {
    return unwrap<ProviderDashboard>(api.get(`/prestador/dashboard?guideId=${requireGuideId()}`));
  }

  static acceptRequest(reservationId: number) {
    return unwrap(api.post(`/prestador/pedidos/${reservationId}/aceitar`, { guideId: requireGuideId() }));
  }

  static rejectRequest(reservationId: number, reason = '') {
    return unwrap(api.post(`/prestador/pedidos/${reservationId}/recusar`, { guideId: requireGuideId(), reason }));
  }

  static completeReservation(reservationId: number) {
    return unwrap(api.post(`/prestador/pedidos/${reservationId}/concluir`, { guideId: requireGuideId() }));
  }

  static withdraw() {
    return unwrap<{ message: string; formatted_amount: string }>(
      api.post('/prestador/saque', { guideId: requireGuideId() })
    );
  }

  static getCategories() {
    return unwrap<string[]>(api.get('/prestador/categorias'));
  }

  /** Tags prontas para "O que está incluído" (as já usadas nos passeios do app). */
  static getInclusionSuggestions() {
    return unwrap<string[]>(api.get('/prestador/inclusoes'));
  }

  static getExperience(id: number) {
    return unwrap<any>(api.get(`/prestador/passeios/${id}?guideId=${requireGuideId()}`));
  }

  static saveExperience(form: ExperienceForm, id?: number) {
    const body = { ...form, guideId: requireGuideId() };
    return unwrap<any>(id ? api.put(`/prestador/passeios/${id}`, body) : api.post('/prestador/passeios', body));
  }

  static setExperienceActive(id: number, isActive: boolean) {
    return unwrap(api.put(`/prestador/passeios/${id}/status`, { guideId: requireGuideId(), is_active: isActive }));
  }

  /**
   * Abre a galeria (ou câmera) e envia a imagem escolhida ao backend.
   * Retorna null se o usuário cancelar.
   */
  static async pickAndUpload(source: 'library' | 'camera' = 'library'): Promise<UploadedFile | null> {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.6,
      base64: true,
      allowsEditing: false,
    };

    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera' && Platform.OS !== 'web') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) throw new Error('Permita o acesso à câmera para tirar a foto.');
      result = await ImagePicker.launchCameraAsync({ ...options, cameraType: ImagePicker.CameraType.front });
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (result.canceled || !result.assets?.length) return null;
    const asset = result.assets[0];

    // Web: uri costuma ser data: ou blob:. Celular: montamos a partir do base64.
    let dataUri: string;
    if (asset.uri.startsWith('data:')) {
      dataUri = asset.uri;
    } else if (asset.base64) {
      dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
    } else {
      dataUri = await uriToDataUri(asset.uri);
    }

    const uploaded = await unwrap<{ key: string; file_name: string; size_label: string }>(
      api.post('/prestador/upload', { dataUri, fileName: asset.fileName || undefined }, { timeoutMs: 30000 })
    );
    return { uri: uploaded.key, name: uploaded.file_name, size: uploaded.size_label };
  }

  static getCadastur() {
    return unwrap<CadasturData>(api.get(`/prestador/cadastur?guideId=${requireGuideId()}`));
  }

  static saveCadastur(data: Partial<CadasturData>) {
    return unwrap<CadasturData>(api.put('/prestador/cadastur', { ...data, guideId: requireGuideId() }));
  }

  static submitCadastur(data: Partial<CadasturData>) {
    return unwrap<CadasturData>(api.post('/prestador/cadastur/enviar', { ...data, guideId: requireGuideId() }));
  }

  /** Simula a aprovação pela equipe técnica (para testes). */
  static approveCadastur() {
    return unwrap<CadasturData>(api.post('/prestador/cadastur/aprovar', { guideId: requireGuideId() }));
  }

  static getConversations() {
    return unwrap<Conversation[]>(api.get(`/prestador/conversas?guideId=${requireGuideId()}`));
  }

  static getConversation(touristId: number) {
    return unwrap<ProviderConversation>(api.get(`/prestador/conversas/${touristId}?guideId=${requireGuideId()}`));
  }

  static sendMessage(touristId: number, text: string) {
    return unwrap<ProviderChatMessage>(
      api.post(`/prestador/conversas/${touristId}`, { guideId: requireGuideId(), text })
    );
  }
}
