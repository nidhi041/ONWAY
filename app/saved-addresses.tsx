import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAddresses } from '@/hooks/useFirestore';

interface AddressForm {
  type: 'home' | 'work';
  name: string;
  address: string;
  phone: string;
}

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: any;
  onEdit: (address: any) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) => (
  <View style={styles.addressCard}>
    <View style={styles.cardHeader}>
      <View style={styles.labelSection}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{address.type.toUpperCase()}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.addressDetails}>
      <Text style={[styles.addressText, { color: Colors.light.text }]}>
        {address.name}
      </Text>
      <Text style={styles.cityText}>{address.address}</Text>
      <Text style={styles.phoneText}>{address.phone}</Text>
    </View>

    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEdit(address)}
      >
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.actionButtonSecondary]}
        onPress={() => onDelete(address.id)}
      >
        <Text style={styles.actionButtonTextSecondary}>Delete</Text>
      </TouchableOpacity>
      {!address.isDefault && (
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonTertiary]}
          onPress={() => onSetDefault(address.id)}
        >
          <Text style={styles.actionButtonTextTertiary}>Set Default</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function SavedAddressesScreen() {
  const router = useRouter();
  const { addresses, loading, addAddress, deleteAddress, updateAddress, setDefaultAddress } = useAddresses();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<AddressForm>({
    type: 'home',
    name: '',
    address: '',
    phone: '',
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      type: 'home',
      name: '',
      address: '',
      phone: '',
    });
    setModalVisible(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      address: address.address,
      phone: address.phone,
    });
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.name || !formData.address || !formData.phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, {
          ...formData,
          isDefault: editingAddress.isDefault,
        } as any);
      } else {
        await addAddress({
          ...formData,
          isDefault: addresses.length === 0,
        } as any);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(id);
          } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to set default address');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#35aeff" />
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
          Saved Addresses
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {addresses.length > 0 ? (
            <View style={styles.addressesContainer}>
              {addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={[styles.emptyTitle, { color: Colors.light.text }]}>
                No Addresses Yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Add your first address to get started
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Address Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddAddress}>
        <Text style={styles.addButtonText}>+ Add New Address</Text>
      </TouchableOpacity>

      {/* Modal for Add/Edit Address */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => !isSaving && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => !isSaving && setModalVisible(false)} disabled={isSaving}>
                <Text style={styles.closeButton}>{isSaving ? '' : '✕'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Address Type
                </Text>
                <View style={styles.labelOptionsContainer}>
                  {['home', 'work'].map((type: string) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.labelOption,
                        formData.type === type && styles.labelOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, type: type as 'home' | 'work' })}
                      disabled={isSaving}
                    >
                      <Text
                        style={[
                          styles.labelOptionText,
                          formData.type === type && styles.labelOptionTextActive,
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Recipient Name
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Enter recipient name"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Full Address
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Enter your complete address"
                  placeholderTextColor="#999"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  multiline
                  numberOfLines={3}
                  editable={!isSaving}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  editable={!isSaving}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSaveAddress} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  contentContainer: {
    paddingVertical: 12,
  },
  addressesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  labelBadge: {
    backgroundColor: '#35aeff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cityText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#999',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#35aeff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  actionButtonTertiary: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextTertiary: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#35aeff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  labelOptionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  labelOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  labelOptionActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#35aeff',
  },
  labelOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  labelOptionTextActive: {
    color: '#35aeff',
  },
  submitButton: {
    backgroundColor: '#35aeff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});
