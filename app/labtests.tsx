import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { useRouter as useExpoRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AVAILABLE_TESTS = [
  { id: '1', name: 'Complete Blood Count (CBC)', price: 350 },
  { id: '2', name: 'Lipid Profile', price: 600 },
  { id: '3', name: 'Thyroid Profile (T3, T4, TSH)', price: 550 },
  { id: '4', name: 'HbA1c (Glycosylated Hemoglobin)', price: 450 },
  { id: '5', name: 'Liver Function Test (LFT)', price: 700 },
  { id: '6', name: 'Kidney Function Test (KFT)', price: 750 },
  { id: '7', name: 'Blood Pressure Check', price: 100 },
  { id: '8', name: 'Blood Sugar (Fasting & PP)', price: 200 },
];

export default function LabTestsScreen() {
  const router = useExpoRouter();
  const { user } = useAuth();

  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleTest = (id: string) => {
    setSelectedTests(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleBook = () => {
    if (selectedTests.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one lab test.');
      return;
    }
    if (!name.trim() || !mobile.trim() || !age.trim()) {
      Alert.alert('Missing Details', 'Please fill in all the details.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to book an appointment.');
      return;
    }

    const selectedTestDetails = AVAILABLE_TESTS.filter(t => selectedTests.includes(t.id));
    const totalAmount = selectedTestDetails.reduce((sum, test) => sum + test.price, 0);

    // Proceed to Step 2
    router.push({
      pathname: '/labtests-address',
      params: {
        tests: JSON.stringify(selectedTestDetails),
        totalAmount,
        name: name.trim(),
        mobile: mobile.trim(),
        age: age.trim(),
      }
    });
  };

  const totalAmount = AVAILABLE_TESTS.filter(t => selectedTests.includes(t.id)).reduce((sum, test) => sum + test.price, 0);

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Book Lab Tests</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={st.content} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 250 }}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Banner */}
          <View style={st.banner}>
            <View style={st.bannerIconContainer}>
              <Ionicons name="flask" size={20} color={C.blue} />
            </View>
            <View style={st.bannerTextContainer}>
              <Text style={st.bannerTitle}>Home Sample Collection</Text>
              <Text style={st.bannerSubtitle}>Safe, hygienic, and convenient</Text>
            </View>
          </View>

          {/* Test Selection */}
          <Text style={st.sectionTitle}>Select Tests</Text>
          <View style={st.testsContainer}>
            {AVAILABLE_TESTS.map((test) => {
              const isSelected = selectedTests.includes(test.id);
              return (
                <TouchableOpacity
                  key={test.id}
                  style={[st.testCard, isSelected && st.testCardSelected]}
                  activeOpacity={0.7}
                  onPress={() => toggleTest(test.id)}
                >
                  <View style={st.testInfo}>
                    <Text style={[st.testName, isSelected && st.testNameSelected]}>{test.name}</Text>
                    <Text style={st.testPrice}>₹{test.price}</Text>
                  </View>
                  <View style={[st.checkbox, isSelected && st.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Patient Details Form */}
          <Text style={st.sectionTitle}>Patient Details</Text>
          <View style={st.formContainer}>
            <View style={st.inputGroup}>
              <Text style={st.inputLabel}>Full Name</Text>
              <TextInput
                style={st.input}
                placeholder="Enter patient name"
                placeholderTextColor={C.inkLight}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={st.rowInputs}>
              <View style={[st.inputGroup, { flex: 2, marginRight: 12 }]}>
                <Text style={st.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={st.input}
                  placeholder="10-digit number"
                  placeholderTextColor={C.inkLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>

              <View style={[st.inputGroup, { flex: 1 }]}>
                <Text style={st.inputLabel}>Age</Text>
                <TextInput
                  style={st.input}
                  placeholder="Years"
                  placeholderTextColor={C.inkLight}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={age}
                  onChangeText={setAge}
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Action Button */}
      <View style={st.footer}>
        <View style={st.totalContainer}>
          <Text style={st.totalLabel}>Total Amount</Text>
          <Text style={st.totalAmount}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          style={[st.bookButton, (selectedTests.length === 0 || loading) && st.bookButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleBook}
          disabled={selectedTests.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={st.bookButtonText}>Next: Add Address</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.bg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow('sm'),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.3,
  },
  content: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.borderLight,
    ...shadow('sm'),
  },
  bannerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: C.inkSub,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  testsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  testCardSelected: {
    borderColor: C.blue,
    backgroundColor: '#F4F8FF', // subtle blue tint
  },
  testInfo: {
    flex: 1,
    paddingRight: 16,
  },
  testName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.ink,
    marginBottom: 4,
  },
  testNameSelected: {
    color: C.blue,
  },
  testPrice: {
    fontSize: 14,
    color: C.inkSub,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkSub,
    marginLeft: 4,
  },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.border,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow('md'),
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: C.inkSub,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: C.blue,
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: C.blue,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow('blue'),
  },
  bookButtonDisabled: {
    backgroundColor: C.inkLight,
    shadowOpacity: 0,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
