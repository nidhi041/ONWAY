import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
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

const InputField = ({
  label, icon, value, onChange, placeholder,
  keyboard = 'default' as any, secure = false,
  showToggle = false, onToggle = () => {}, error = '',
  loading = false,
}: any) => (
  <View style={st.field}>
    <Text style={st.label}>{label}</Text>
    <View style={[st.inputBox, error && st.inputBoxError]}>
      <Text style={st.inputIcon}>{icon}</Text>
      <TextInput
        style={st.input}
        placeholder={placeholder}
        placeholderTextColor={C.inkMuted}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        secureTextEntry={secure}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
        editable={!loading}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={st.eyeIcon}>{secure ? '👁‍🗨' : '👁'}</Text>
        </TouchableOpacity>
      )}
    </View>
    {error ? <Text style={st.errText}>{error}</Text> : null}
  </View>
);

export default function SignupScreen() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getPasswordStrength = (pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score === 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    return { level: 3, label: 'Strong', color: '#22C55E' };
  };
  const pwStrength = getPasswordStrength(password);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '40420149902-40c5dv01ohpul08gknr12ef6ftl2cu2p.apps.googleusercontent.com',
    clientId: '40420149902-40c5dv01ohpul08gknr12ef6ftl2cu2p.apps.googleusercontent.com',
  });

  const handleGoogleSignup = useCallback(async (idToken: string) => {
    setLoading(true);
    try { await loginWithGoogle(idToken); router.replace('/profile'); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Google signup failed'); }
    finally { setLoading(false); }
  }, [loginWithGoogle, router]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) handleGoogleSignup(id_token);
    }
  }, [response, handleGoogleSignup]);

  useEffect(() => {
    if (request?.redirectUri) {
      console.log('--- GOOGLE REDIRECT URI FOR SIGNUP ---');
      console.log(request.redirectUri);
      console.log('-------------------------------------');
    }
  }, [request]);

  const clr = (f: string) => setErrors(e => ({ ...e, [f]: '' }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email) e.email = 'Email is required';
    else if (!email.includes('@')) e.email = 'Enter a valid email';
    if (!phone) e.phone = 'Phone number is required';
    else if (phone.length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    if (!confirm) e.confirm = 'Please confirm your password';
    else if (password !== confirm) e.confirm = 'Passwords do not match';
    if (!agreed) e.terms = 'Please agree to the terms to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try { await signup(name, email, password, phone); router.replace('/profile'); }
    catch (e) { Alert.alert('Error', e instanceof Error ? e.message : 'Signup failed'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={st.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity style={st.backBtn} onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={st.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={st.brand}>
            <View style={st.brandIconBox}>
              <View style={st.brandDot} />
              <Text style={st.brandIcon}>⚡</Text>
            </View>
            <Text style={st.brandName}>OnWay</Text>
          </View>

          <View style={st.card}>
            <Text style={st.cardTitle}>Create account</Text>
            <Text style={st.cardSub}>Join thousands getting healthcare delivered fast</Text>

            <InputField label="Full Name" icon="👤" value={name} onChange={(t: string) => { setName(t); clr('name'); }} placeholder="Your full name" error={errors.name} loading={loading} />
            <InputField label="Email Address" icon="✉️" value={email} onChange={(t: string) => { setEmail(t); clr('email'); }} placeholder="you@example.com" keyboard="email-address" error={errors.email} loading={loading} />
            <InputField label="Phone Number" icon="📱" value={phone} onChange={(t: string) => { setPhone(t); clr('phone'); }} placeholder="10-digit mobile number" keyboard="phone-pad" error={errors.phone} loading={loading} />
            <InputField label="Password" icon="🔒" value={password} onChange={(t: string) => { setPassword(t); clr('password'); }} placeholder="Minimum 6 characters" secure={!showPw} showToggle onToggle={() => setShowPw(!showPw)} error={errors.password} loading={loading} />
            {password.length > 0 && (
              <View style={st.strengthContainer}>
                <View style={st.strengthBars}>
                  {[1, 2, 3].map(i => (
                    <View
                      key={i}
                      style={[
                        st.strengthBar,
                        pwStrength.level >= i && { backgroundColor: pwStrength.color }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[st.strengthLabel, { color: pwStrength.color }]}>{pwStrength.label}</Text>
              </View>
            )}
            <InputField label="Confirm Password" icon="🔒" value={confirm} onChange={(t: string) => { setConfirm(t); clr('confirm'); }} placeholder="Repeat your password" secure={!showCpw} showToggle onToggle={() => setShowCpw(!showCpw)} error={errors.confirm} loading={loading} />

            {/* Terms */}
            <TouchableOpacity style={st.termsRow} onPress={() => { setAgreed(!agreed); clr('terms'); }} disabled={loading} activeOpacity={0.75}>
              <View style={[st.checkbox, agreed && st.checkboxOn]}>
                {agreed && <Text style={st.checkmark}>✓</Text>}
              </View>
              <Text style={st.termsText}>
                I agree to the <Text style={st.termsLink}>Terms & Conditions</Text> and <Text style={st.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={st.errText}>{errors.terms}</Text> : null}

            <TouchableOpacity
              style={[st.primaryBtn, loading && { opacity: 0.65 }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={st.primaryBtnText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={st.divider}>
              <View style={st.dividerLine} />
              <Text style={st.dividerText}>or continue with</Text>
              <View style={st.dividerLine} />
            </View>

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
            <Text style={st.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
              <Text style={st.footerLink}>Sign in</Text>
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
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  backIcon: { fontSize: 18, color: C.ink },

  brand: { alignItems: 'center', marginBottom: 24 },
  brandIconBox: { position: 'relative', marginBottom: 10 },
  brandDot: { position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: C.teal },
  brandIcon: { fontSize: 36 },
  brandName: { fontSize: 24, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },

  card: {
    backgroundColor: C.surface, borderRadius: 24,
    padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: C.border,
    ...shadow('md'),
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 6 },
  cardSub: { fontSize: 13, color: C.inkSub, marginBottom: 22 },

  field: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: C.inkSub, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 50, backgroundColor: C.bg, borderWidth: 1.5,
    borderColor: C.border, borderRadius: 14, paddingHorizontal: 14,
  },
  inputBoxError: { borderColor: C.error, backgroundColor: C.errorBg },
  inputIcon: { fontSize: 15 },
  input: { flex: 1, fontSize: 14, color: C.ink, padding: 0, fontWeight: '500' },
  eyeIcon: { fontSize: 16 },
  errText: { fontSize: 11, color: C.error, marginTop: 5, fontWeight: '500' },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },

  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -10, marginBottom: 16 },
  strengthBars: { flexDirection: 'row', gap: 5, flex: 1 },
  strengthBar: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  strengthLabel: { fontSize: 11, fontWeight: '700', minWidth: 40, textAlign: 'right' },

  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: C.border, backgroundColor: C.surface,
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: C.blue, borderColor: C.blue },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  termsText: { flex: 1, fontSize: 13, color: C.inkSub, lineHeight: 20 },
  termsLink: { color: C.blue, fontWeight: '600' },

  primaryBtn: {
    height: 52, backgroundColor: C.blue, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
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
