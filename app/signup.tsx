import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Please agree to terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, phone);
      router.replace('/(tabs)/profile');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors.light.text }]}>Sign Up</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={[styles.appName, { color: Colors.light.text }]}>ONWAY</Text>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeTitle, { color: Colors.light.text }]}>
            Create Account
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Join us for fast delivery and amazing deals
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.light.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                { color: Colors.light.text },
                errors.name ? styles.inputError : {},
              ]}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: '' });
                }
              }}
              editable={!loading}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.light.text }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                { color: Colors.light.text },
                errors.email ? styles.inputError : {},
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.light.text }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                { color: Colors.light.text },
                errors.phone ? styles.inputError : {},
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (errors.phone) {
                  setErrors({ ...errors, phone: '' });
                }
              }}
              keyboardType="phone-pad"
              editable={!loading}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.light.text }]}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                errors.password ? styles.passwordContainerError : {},
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: Colors.light.text }]}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors.light.text }]}>Confirm Password</Text>
            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword ? styles.passwordContainerError : {},
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: Colors.light.text }]}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => {
              setAgreeTerms(!agreeTerms);
              if (errors.terms) {
                setErrors({ ...errors, terms: '' });
              }
            }}
            disabled={loading}
          >
            <View
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
            >
              {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.termsText, { color: Colors.light.text }]}>
              I agree to Terms & Conditions
            </Text>
          </TouchableOpacity>
          {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Signup */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Text style={styles.socialIcon}>🔵</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Text style={styles.socialIcon}>🔴</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} disabled={loading}>
              <Text style={styles.socialIcon}>⚫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: Colors.light.text }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/login')} disabled={loading}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  welcomeContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingRight: 12,
  },
  passwordContainerError: {
    borderColor: '#E53935',
    backgroundColor: '#FFEBEE',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#E53935',
    fontSize: 12,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#35aeff',
    borderColor: '#35aeff',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 14,
  },
  signupButton: {
    backgroundColor: '#35aeff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialIcon: {
    fontSize: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '700',
  },
});
