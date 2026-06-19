import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Linking, Alert, ActivityIndicator,
  Platform, StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, shadow } from '@/constants/theme';
import { useDoctors, Doctor } from '@/hooks/useFirestore';
import { Skeleton } from '@/components/ui/Skeleton';

const WHATSAPP_GREETING = (doctorName: string) =>
  `Hi ${doctorName}, I'd like to consult with you via MedBix.`;

const openWhatsApp = (doctor: Doctor) => {
  const message = encodeURIComponent(WHATSAPP_GREETING(doctor.name));
  const url = `https://wa.me/${doctor.whatsapp}?text=${message}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp not found',
          'Please install WhatsApp to chat with the doctor.',
          [{ text: 'OK' }]
        );
      }
    })
    .catch(() => {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    });
};

// ─── Doctor Card ──────────────────────────────────────────────────────────────

const DoctorCard = React.memo(({ doctor }: { doctor: Doctor }) => {
  const hasImage = doctor.imageUrl && doctor.imageUrl.length > 0;

  return (
    <View style={st.card}>
      <View style={st.cardHeader}>
        {/* Avatar */}
        <View style={st.avatarWrapper}>
          {hasImage ? (
            <Image
              source={{ uri: doctor.imageUrl }}
              style={st.avatar}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <View style={st.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={C.blue} />
            </View>
          )}
          <View style={st.onlineIndicator} />
        </View>

        {/* Doctor Info */}
        <View style={st.infoWrapper}>
          <Text style={st.doctorName}>{doctor.name}</Text>
          <Text style={st.doctorSpecialty}>{doctor.specialty}</Text>
          
          <View style={st.statsRow}>
            <View style={st.statItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={st.statText}>{doctor.rating?.toFixed(1) || '—'}</Text>
            </View>
            <View style={st.statDivider} />
            <View style={st.statItem}>
              <Ionicons name="briefcase-outline" size={14} color={C.inkSub} />
              <Text style={st.statText}>{doctor.experience || 'N/A'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={st.cardFooter}>
        <TouchableOpacity
          style={st.connectButton}
          activeOpacity={0.85}
          onPress={() => openWhatsApp(doctor)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={st.connectButtonText}>Connect via WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const router = useRouter();
  const { doctors, loading, error } = useDoctors();

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <DoctorCard doctor={item} />
  );

  return (
    <SafeAreaView style={st.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={st.header}>
        <TouchableOpacity style={st.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={C.ink} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Consultants</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Info Banner ── */}
      <View style={st.banner}>
        <View style={st.bannerIconContainer}>
          <Ionicons name="medical" size={20} color={C.blue} />
        </View>
        <View style={st.bannerTextContainer}>
          <Text style={st.bannerTitle}>Professional Medical Advice</Text>
          <Text style={st.bannerSubtitle}>Connect directly with verified specialists</Text>
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={st.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={st.skeletonCard}>
              <View style={st.skeletonRow}>
                <Skeleton style={st.skeletonAvatar} />
                <View style={{ flex: 1 }}>
                  <Skeleton style={st.skeletonTextLine1} />
                  <Skeleton style={st.skeletonTextLine2} />
                </View>
              </View>
              <Skeleton style={st.skeletonButton} />
            </View>
          ))}
        </View>
      ) : error ? (
        <View style={st.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={C.error} />
          <Text style={st.emptyStateTitle}>Failed to load</Text>
          <Text style={st.emptyStateSubtitle}>{error}</Text>
        </View>
      ) : doctors.length === 0 ? (
        <View style={st.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={C.inkMuted} />
          <Text style={st.emptyStateTitle}>No consultants available</Text>
          <Text style={st.emptyStateSubtitle}>Please check back later for available specialists.</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          contentContainerStyle={st.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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

  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
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

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.borderLight,
    ...shadow('sm'),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surfaceAlt,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.success,
    borderWidth: 2.5,
    borderColor: C.surface,
  },
  infoWrapper: {
    flex: 1,
  },
  doctorName: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: C.blue,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: C.inkSub,
    fontWeight: '500',
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    marginHorizontal: 8,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
    paddingTop: 16,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    ...shadow('sm'),
  },
  connectButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },

  // Skeleton
  skeletonContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.borderLight,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  skeletonTextLine1: {
    width: '60%',
    height: 18,
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonTextLine2: {
    width: '40%',
    height: 14,
    borderRadius: 6,
  },
  skeletonButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: C.inkSub,
    textAlign: 'center',
    lineHeight: 22,
  },
});
