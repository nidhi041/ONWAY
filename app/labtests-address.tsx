import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, KeyboardAvoidingView,
  Platform, StatusBar, ActivityIndicator
} from 'react-native';
import { useRouter as useExpoRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';

export default function LabTestsAddressScreen() {
  const router = useExpoRouter();
  const { user } = useAuth();
  
  // Get data passed from Step 1
  const params = useLocalSearchParams();
  const tests = params.tests ? JSON.parse(params.tests as string) : [];
  const totalAmount = params.totalAmount ? Number(params.totalAmount) : 0;
  const patientName = params.name as string;
  const patientMobile = params.mobile as string;
  const patientAge = params.age as string;

  // Form State
  const [apartment, setApartment] = useState('');
  const [building, setBuilding] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to auto-detect your address.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const result = geocode[0];
        if (result.postalCode) setPincode(result.postalCode);
        if (result.street || result.name) setLandmark(result.street || result.name || '');
        if (result.subregion || result.city) setBuilding(result.subregion || result.city || '');
      } else {
        Alert.alert('Location Not Found', 'Could not detect your exact address details.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to detect location. Please enter your details manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleConfirm = async () => {
    if (!apartment.trim() || !building.trim() || !pincode.trim()) {
      Alert.alert('Missing Details', 'Please fill in all the required address fields (Apartment, Building, Pincode).');
      return;
    }
    
    if (pincode.trim().length !== 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to complete your booking.');
      return;
    }

    setLoading(true);
    try {
      const fullAddressObject = {
        apartment: apartment.trim(),
        building: building.trim(),
        landmark: landmark.trim(),
        pincode: pincode.trim()
      };

      await addDoc(collection(db, 'users', user.id, 'labAppointments'), {
        userId: user.id,
        name: patientName,
        mobile: patientMobile,
        age: patientAge,
        address: fullAddressObject,
        tests: tests,
        totalAmount: totalAmount,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        'Booking Confirmed',
        'Your lab test appointment has been successfully booked. Our team will contact you shortly.',
        [{ text: 'OK', onPress: () => router.navigate('/(tabs)') }]
      );
    } catch (error) {
      console.error('Error booking lab test:', error);
      Alert.alert('Error', 'Failed to confirm booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Sample Collection Address</Text>
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
          {/* Step Indicator / Banner */}
          <View style={st.banner}>
            <View style={st.bannerIconContainer}>
              <Ionicons name="location" size={20} color={C.blue} />
            </View>
            <View style={st.bannerTextContainer}>
              <Text style={st.bannerTitle}>Step 2: Address Details</Text>
              <Text style={st.bannerSubtitle}>Where should the phlebotomist arrive?</Text>
            </View>
          </View>

          {/* Address Details Form */}
          <Text style={st.sectionTitle}>Full Address</Text>
          <View style={st.formContainer}>
            
            <TouchableOpacity
              style={st.detectLocationBtn}
              onPress={handleDetectLocation}
              disabled={isDetectingLocation}
              activeOpacity={0.8}
            >
              {isDetectingLocation ? (
                <ActivityIndicator size="small" color="#35aeff" />
              ) : (
                <>
                  <Text style={st.detectLocationIcon}>📍</Text>
                  <Text style={st.detectLocationText}>Use Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={st.inputGroup}>
              <Text style={st.inputLabel}>Apartment No. & Block *</Text>
              <TextInput
                style={st.input}
                placeholder="e.g. Flat 402, Block B"
                placeholderTextColor={C.inkLight}
                value={apartment}
                onChangeText={setApartment}
              />
            </View>

            <View style={st.inputGroup}>
              <Text style={st.inputLabel}>Building / Society Name *</Text>
              <TextInput
                style={st.input}
                placeholder="e.g. Royal Residency"
                placeholderTextColor={C.inkLight}
                value={building}
                onChangeText={setBuilding}
              />
            </View>

            <View style={st.inputGroup}>
              <Text style={st.inputLabel}>Nearby Landmark (Optional)</Text>
              <TextInput
                style={st.input}
                placeholder="e.g. Opposite City Mall"
                placeholderTextColor={C.inkLight}
                value={landmark}
                onChangeText={setLandmark}
              />
            </View>

            <View style={st.inputGroup}>
              <Text style={st.inputLabel}>Pincode *</Text>
              <TextInput
                style={st.input}
                placeholder="6-digit PIN"
                placeholderTextColor={C.inkLight}
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
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
          style={[st.bookButton, loading && st.bookButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={st.bookButtonText}>Confirm Booking</Text>
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
  formContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
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
  detectLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#35aeff',
    gap: 8,
  },
  detectLocationIcon: {
    fontSize: 16,
  },
  detectLocationText: {
    color: '#35aeff',
    fontSize: 14,
    fontWeight: '700',
  },
});
