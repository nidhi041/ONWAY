import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

interface TestItem {
  id: string;
  name: string;
  price: number;
}

interface Address {
  apartment: string;
  building: string;
  landmark: string;
  pincode: string;
}

interface LabBooking {
  id: string;
  name: string;
  mobile: string;
  age: string;
  tests: TestItem[];
  totalAmount: number;
  status: string;
  address?: Address;
  createdAt?: any;
}

export default function LabBookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'users', user.id, 'labAppointments'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const data: LabBooking[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as LabBooking);
      });

      setBookings(data);
    } catch (error) {
      console.error('Error fetching lab bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return C.success;
      case 'completed': return C.blue;
      case 'cancelled': return C.error;
      default: return '#F59E0B'; // Pending (Yellow)
    }
  };

  const renderBooking = ({ item }: { item: LabBooking }) => {
    const dateStr = item.createdAt?.toDate 
      ? item.createdAt.toDate().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric'
        })
      : 'Recently';

    return (
      <View style={st.card}>
        {/* Header */}
        <View style={st.cardHeader}>
          <View style={st.dateBox}>
            <Ionicons name="calendar-outline" size={14} color={C.inkSub} />
            <Text style={st.dateText}>{dateStr}</Text>
          </View>
          <View style={[st.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[st.statusText, { color: getStatusColor(item.status) }]}>
              {item.status || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={st.divider} />

        {/* Patient Info */}
        <View style={st.patientRow}>
          <View style={st.avatarPlaceholder}>
            <Text style={st.avatarText}>{item.name?.charAt(0)?.toUpperCase() || 'P'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.patientName}>{item.name}</Text>
            <Text style={st.patientMeta}>{item.age} Years • {item.mobile}</Text>
          </View>
        </View>

        {/* Tests List */}
        <View style={st.testsContainer}>
          <Text style={st.sectionLabel}>Tests Booked:</Text>
          {item.tests?.map((test, index) => (
            <View key={index} style={st.testItem}>
              <View style={st.testDot} />
              <Text style={st.testName}>{test.name}</Text>
            </View>
          ))}
        </View>

        {/* Address (If available from multi-step flow) */}
        {item.address && (
          <View style={st.addressContainer}>
            <Ionicons name="location-outline" size={14} color={C.inkSub} style={{ marginTop: 2 }} />
            <Text style={st.addressText}>
              {item.address.apartment}, {item.address.building}
              {item.address.landmark ? `, ${item.address.landmark}` : ''}
              {` - ${item.address.pincode}`}
            </Text>
          </View>
        )}

        <View style={st.divider} />

        {/* Footer */}
        <View style={st.cardFooter}>
          <Text style={st.totalLabel}>Total Amount</Text>
          <Text style={st.totalAmount}>₹{item.totalAmount}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={st.header}>
        <TouchableOpacity style={st.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Lab Test Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={st.center}>
          <ActivityIndicator size="large" color={C.blue} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={st.emptyContainer}>
          <Ionicons name="flask-outline" size={64} color={C.inkLight} />
          <Text style={st.emptyTitle}>No Bookings Found</Text>
          <Text style={st.emptySubtitle}>You haven't booked any lab tests yet.</Text>
          <TouchableOpacity 
            style={st.bookNowBtn}
            onPress={() => router.replace('/labtests')}
            activeOpacity={0.8}
          >
            <Text style={st.bookNowText}>Book a Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={st.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  
  // Card Styles
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.borderLight,
    ...shadow('sm'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: C.inkSub,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginVertical: 12,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.blue,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 13,
    color: C.inkSub,
  },
  testsContainer: {
    backgroundColor: C.bg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.inkSub,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  testDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.blue,
  },
  testName: {
    fontSize: 14,
    color: C.ink,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: C.inkSub,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.inkSub,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: C.blue,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.inkSub,
    textAlign: 'center',
    marginBottom: 24,
  },
  bookNowBtn: {
    backgroundColor: C.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    ...shadow('blue'),
  },
  bookNowText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
