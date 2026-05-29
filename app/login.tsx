import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
    ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '40420149902-40c5dv01ohpul08gknr12ef6ftl2cu2p.apps.googleusercontent.com',
    clientId: '40420149902-40c5dv01ohpul08gknr12ef6ftl2cu2p.apps.googleusercontent.com',
  });

  const handleGoogleLogin = useCallback(async (idToken: string) => {
    setLoading(true);
    try { await loginWithGoogle(idToken); router.replace('/profile'); }
    catch (e) { Alert.alert('Login Failed', e instanceof Error ? e.message : 'Google login failed'); }
    finally { setLoading(false); }
  }, [loginWithGoogle, router]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleLogin(id_token);
    }
  }, [response, handleGoogleLogin]);

  useEffect(() => {
    if (request?.redirectUri) {
      console.log('--- GOOGLE REDIRECT URI FOR LOGIN ---');
      console.log(request.redirectUri);
      console.log('------------------------------------');
    }
  }, [request]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email is required';
    else if (!email.includes('@')) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try { await login(email, password); router.replace('/profile'); }
    catch (e) { Alert.alert('Login Failed', e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setErrors({ email: 'Please enter a valid email to reset password' });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={st.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Brand */}
          <View style={st.brand}>
            <View style={st.brandIconBox}>
              <View style={st.brandDot} />
              <Text style={st.brandIcon}>⚡</Text>
            </View>
            <Text style={st.brandName}>OnWay</Text>
            <Text style={st.brandTagline}>Healthcare delivered in minutes</Text>
          </View>

          {/* Card */}
          <View style={st.card}>
            <Text style={st.cardTitle}>Welcome back</Text>
            <Text style={st.cardSub}>Sign in to continue your health journey</Text>

            {/* Email */}
            <View style={st.field}>
              <Text style={st.label}>Email Address</Text>
              <View style={[st.inputBox, errors.email && st.inputBoxError]}>
                <Text style={st.inputIcon}>✉️</Text>
                <TextInput
                  style={st.input}
                  placeholder="you@example.com"
                  placeholderTextColor={C.inkMuted}
                  value={email}
                  onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email ? <Text style={st.errText}>{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View style={st.field}>
              <Text style={st.label}>Password</Text>
              <View style={[st.inputBox, errors.password && st.inputBoxError]}>
                <Text style={st.inputIcon}>🔒</Text>
                <TextInput
                  style={st.input}
                  placeholder="Enter your password"
                  placeholderTextColor={C.inkMuted}
                  value={password}
                  onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
                  secureTextEntry={!showPw}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={st.eyeIcon}>{showPw ? '👁' : '👁‍🗨'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={st.errText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity style={st.forgotRow} disabled={loading} onPress={handleForgotPassword}>
              <Text style={st.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign in */}
            <TouchableOpacity
              style={[st.primaryBtn, loading && { opacity: 0.65 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={st.primaryBtnText}>Sign In</Text>}
            </TouchableOpacity>

            {/* Divider */}
            <View style={st.divider}>
              <View style={st.dividerLine} />
              <Text style={st.dividerText}>or continue with</Text>
              <View style={st.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity
              style={[st.googleBtn, loading && { opacity: 0.65 }]}
              onPress={() => promptAsync()}
              disabled={!request || loading}
              activeOpacity={0.88}
            >
              <Text style={st.googleG}>G</Text>
              <Text style={st.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          <View style={st.footer}>
            <Text style={st.footerText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={() => router.push('/signup')} disabled={loading}>
              <Text style={st.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },

  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
  },
  backIcon: { fontSize: 18, color: C.ink },

  brand: { alignItems: 'center', marginBottom: 32 },
  brandIconBox: { position: 'relative', marginBottom: 12 },
  brandDot: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.teal,
  },
  brandIcon: { fontSize: 40 },
  brandName: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 4 },
  brandTagline: { fontSize: 13, color: C.inkMuted },

  card: {
    backgroundColor: C.surface, borderRadius: 24,
    padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 6 },
  cardSub: { fontSize: 14, color: C.inkSub, marginBottom: 24 },

  field: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: C.inkSub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 52, backgroundColor: C.bg, borderWidth: 1.5,
    borderColor: C.border, borderRadius: 14, paddingHorizontal: 14,
  },
  inputBoxError: { borderColor: C.error, backgroundColor: C.errorBg },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 14, color: C.ink, padding: 0, fontWeight: '500' },
  eyeIcon: { fontSize: 17 },
  errText: { fontSize: 11, color: C.error, marginTop: 5, fontWeight: '500' },

  forgotRow: { alignItems: 'flex-end', marginBottom: 22 },
  forgotText: { fontSize: 13, color: C.blue, fontWeight: '600' },

  primaryBtn: {
    height: 52, backgroundColor: C.blue, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    ...shadow('blue'),
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 12, color: C.inkMuted, fontWeight: '500' },

  googleBtn: {
    height: 52, backgroundColor: C.surface, borderWidth: 1.5,
    borderColor: C.border, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: C.ink },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: C.inkSub },
  footerLink: { fontSize: 14, color: C.blue, fontWeight: '700' },
});
