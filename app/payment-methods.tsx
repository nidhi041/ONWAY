import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { usePaymentMethods } from '@/hooks/useFirestore';

type PaymentMethod = 'upi' | 'cards' | 'netbanking';

interface PaymentForm {
  type: PaymentMethod;
  label: string;
  details: string;
}

const PAYMENT_TYPE_OPTIONS: { type: PaymentMethod; icon: string; title: string }[] = [
  { type: 'upi', icon: '📱', title: 'UPI' },
  { type: 'cards', icon: '💳', title: 'Cards' },
  { type: 'netbanking', icon: '🏦', title: 'Net Banking' },
];

const PaymentMethodCard = ({
  payment,
  onPress,
  onDelete,
  onSetDefault,
}: {
  payment: any;
  onPress: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) => (
  <View style={[styles.paymentCard, payment.isDefault && styles.paymentCardDefault]}>
    <TouchableOpacity style={styles.paymentCardContent} onPress={onPress}>
      <View style={styles.paymentIconContainer}>
        <Text style={styles.paymentIcon}>{payment.icon}</Text>
      </View>
      <View style={styles.paymentInfo}>
        <Text style={[styles.paymentLabel, { color: Colors.light.text }]}>
          {payment.label}
        </Text>
        <Text style={styles.paymentDetails}>{payment.details}</Text>
      </View>
      {payment.isDefault && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
    <View style={styles.paymentCardActions}>
      {!payment.isDefault && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onSetDefault}
        >
          <Text style={styles.actionText}>Set Default</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={onDelete}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const AddPaymentModal = ({
  visible,
  onClose,
  onAdd,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (payment: Omit<PaymentForm, 'icon'>) => Promise<void>;
  isLoading: boolean;
}) => {
  const [selectedType, setSelectedType] = useState<PaymentMethod>('upi');
  const [label, setLabel] = useState('');
  const [details, setDetails] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (label.trim() && details.trim()) {
      setIsSaving(true);
      try {
        await onAdd({
          type: selectedType,
          label: label.trim(),
          details: details.trim(),
        });
        setLabel('');
        setDetails('');
        setSelectedType('upi');
        onClose();
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add payment method');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose} disabled={isSaving}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} disabled={isSaving}>
            <Text style={styles.modalCloseButton}>{isSaving ? '' : '✕'}</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
            Add Payment Method
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Payment Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              Payment Type
            </Text>
            <View style={styles.typeGrid}>
              {PAYMENT_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  style={[
                    styles.typeOption,
                    selectedType === option.type && styles.typeOptionSelected,
                  ]}
                  onPress={() => setSelectedType(option.type)}
                  disabled={isSaving}
                >
                  <Text style={styles.typeOptionIcon}>{option.icon}</Text>
                  <Text style={[styles.typeOptionText, { color: Colors.light.text }]}>
                    {option.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Label Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>Label</Text>
            <TextInput
              style={[styles.input, { color: Colors.light.text, borderColor: '#e0e0e0' }]}
              placeholder="e.g., Personal Google Pay"
              placeholderTextColor="#999"
              value={label}
              onChangeText={setLabel}
              editable={!isSaving}
            />
          </View>

          {/* Details Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              {selectedType === 'upi' ? 'UPI ID' : selectedType === 'cards' ? 'Card Number' : 'Bank Account'}
            </Text>
            <TextInput
              style={[styles.input, { color: Colors.light.text, borderColor: '#e0e0e0' }]}
              placeholder={
                selectedType === 'upi'
                  ? 'e.g., yourname@upi'
                  : selectedType === 'cards'
                    ? '1234 5678 9012 3456'
                    : 'Your bank details'
              }
              placeholderTextColor="#999"
              value={details}
              onChangeText={setDetails}
              keyboardType={selectedType === 'cards' ? 'numeric' : 'default'}
              editable={!isSaving}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your payment information is secured and encrypted. We never store full card details.
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.addButton, label.trim() && details.trim() ? {} : styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!label.trim() || !details.trim() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.addButtonText}>Add Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { payments, loading, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod } = usePaymentMethods();
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddPayment = async (newPayment: Omit<PaymentForm, 'icon'>) => {
    const icon = PAYMENT_TYPE_OPTIONS.find(p => p.type === newPayment.type)?.icon || '💳';
    await addPaymentMethod({
      ...newPayment,
      icon,
      isDefault: payments.length === 0,
    });
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert('Delete Payment', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePaymentMethod(id),
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setDefaultPaymentMethod(id);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
          Payment Methods
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {payments.length > 0 ? (
          <>
            {/* Saved Payments Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                Saved Payment Methods
              </Text>
              <View style={styles.paymentsList}>
                {payments.map(payment => (
                  <PaymentMethodCard
                    key={payment.id}
                    payment={payment}
                    onPress={() => {
                      // Edit functionality can be added here
                    }}
                    onDelete={() => handleDeletePayment(payment.id)}
                    onSetDefault={() => handleSetDefault(payment.id)}
                  />
                ))}
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.infoBoxMain}>
              <Text style={styles.infoIcon}>💡</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: Colors.light.text }]}>
                  Pro Tip
                </Text>
                <Text style={styles.infoDescription}>
                  Set a default payment method for faster checkout. You can change it anytime.
                </Text>
              </View>
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
              No Payment Methods
            </Text>
            <Text style={styles.emptySubtitle}>
              Add a payment method to make checkout faster
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addPaymentButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addPaymentButtonIcon}>+</Text>
          <Text style={styles.addPaymentButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>

      {/* Add Payment Modal */}
      <AddPaymentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddPayment}
        isLoading={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 24,
    color: Colors.light.text,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentsList: {
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentCardDefault: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f0',
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 13,
    color: '#666',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  paymentCardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d32f2f',
  },
  infoBoxMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#1976d2',
    lineHeight: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 10,
    paddingVertical: 14,
  },
  addPaymentButtonIcon: {
    fontSize: 24,
    color: '#ffffff',
    marginRight: 8,
    fontWeight: '300',
  },
  addPaymentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    borderColor: '#1976d2',
    backgroundColor: '#e3f2fd',
  },
  typeOptionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f3e5f5',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#7b1fa2',
    flex: 1,
    marginLeft: 8,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: '#1976d2',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
