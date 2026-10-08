import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { QuixaColors } from '@/constants/theme';
import { AppImages } from '@/constants/images';

type ButtonState = 'idle' | 'loading' | 'success';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(
    null
  );
  const [buttonState, setButtonState] = useState<ButtonState>('idle');

  const handleLogin = () => {
    setButtonState('loading');

    setTimeout(() => {
      setButtonState('success');
      setTimeout(() => {
        setButtonState('idle');
        router.replace('/explore');
      }, 600);
    }, 800);
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Um link para redefinir sua senha será enviado para o e-mail cadastrado.'
    );
  };

  const handleCreateAccount = () => {
    router.push('/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Header section with Logo */}
              <View style={styles.headerSection}>
                <View style={styles.logoCircle}>
                  <Image
                    source={AppImages.logo}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </Text>
              </View>

              {/* Form inputs section */}
              <View style={styles.formContainer}>
                {/* Email Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-mail</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedInput === 'email' && styles.inputContainerFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={QuixaColors.secondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="seu@email.com"
                      placeholderTextColor={`${QuixaColors.secondary}a0`}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Senha</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      focusedInput === 'password' && styles.inputContainerFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={QuixaColors.secondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.textInput, styles.passwordInput]}
                      placeholder="Digite sua senha"
                      placeholderTextColor={`${QuixaColors.secondary}a0`}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                      accessibilityLabel="Alternar visibilidade da senha"
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={QuixaColors.secondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleForgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Esqueceu a senha?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={[
                    styles.submitBtn,
                    buttonState === 'loading' && styles.submitBtnLoading,
                    buttonState === 'success' && styles.submitBtnSuccess,
                  ]}
                  onPress={handleLogin}
                  disabled={buttonState !== 'idle'}
                >
                  {buttonState === 'loading' && (
                    <View style={styles.btnContentRow}>
                      <ActivityIndicator size="small" color={QuixaColors.onPrimary} />
                      <Text style={styles.submitBtnText}>Conectando...</Text>
                    </View>
                  )}

                  {buttonState === 'success' && (
                    <View style={styles.btnContentRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={QuixaColors.onPrimary}
                      />
                      <Text style={styles.submitBtnText}>Sucesso!</Text>
                    </View>
                  )}

                  {buttonState === 'idle' && (
                    <View style={styles.btnContentRow}>
                      <Text style={styles.submitBtnText}>Entrar</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color={QuixaColors.onPrimary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Footer section */}
              <View style={styles.footerSection}>
                <Text style={styles.footerText}>
                  Não tem uma conta?{' '}
                  <Text
                    style={styles.signupLink}
                    onPress={handleCreateAccount}
                  >
                    Criar conta
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: QuixaColors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  container: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
    justifyContent: 'space-between',
    minHeight: 580,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: QuixaColors.onSurface,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: QuixaColors.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.secondary,
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: QuixaColors.secondaryContainer,
    borderRadius: 28,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: QuixaColors.primaryContainer,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: QuixaColors.onSurface,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: QuixaColors.secondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  submitBtn: {
    height: 54,
    backgroundColor: QuixaColors.primary,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: QuixaColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnLoading: {
    opacity: 0.9,
  },
  submitBtnSuccess: {
    backgroundColor: '#2e7d32',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: QuixaColors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  footerSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: QuixaColors.onSurfaceVariant,
  },
  signupLink: {
    color: QuixaColors.primary,
    fontWeight: '700',
  },
});
