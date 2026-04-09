import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Address {
  id: string;
  label: string; // Home, Work, Other
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  isDefault: boolean;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    address: '123 Main Street',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    phoneNumber: '+91 9876543210',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    address: '456 Business Avenue',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    phoneNumber: '+91 9876543211',
    isDefault: false,
  },
];

const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) => (
  <View style={styles.addressCard}>
    <View style={styles.cardHeader}>
      <View style={styles.labelSection}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{address.label}</Text>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.menuButton}>
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.addressDetails}>
      <Text style={[styles.addressText, { color: Colors.light.text }]}>
        {address.address}
      </Text>
      <Text style={styles.cityText}>
        {address.city}, {address.state} {address.pincode}
      </Text>
      <Text style={styles.phoneText}>{address.phoneNumber}</Text>
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
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phoneNumber: '',
  });

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      label: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phoneNumber: '',
    });
    setModalVisible(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phoneNumber: address.phoneNumber,
    });
    setModalVisible(true);
  };

  const handleSaveAddress = () => {
    if (
      !formData.label ||
      !formData.address ||
      !formData.city ||
      !formData.pincode ||
      !formData.phoneNumber
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (editingAddress) {
      setAddresses(
        addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : addr
        )
      );
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }

    setModalVisible(false);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const newAddresses = addresses.filter((addr) => addr.id !== id);
          if (newAddresses.length > 0 && addresses.find((a) => a.id === id)?.isDefault) {
            newAddresses[0].isDefault = true;
          }
          setAddresses(newAddresses);
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Address Label
                </Text>
                <View style={styles.labelOptionsContainer}>
                  {['Home', 'Work', 'Other'].map((label) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.labelOption,
                        formData.label === label && styles.labelOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, label })}
                    >
                      <Text
                        style={[
                          styles.labelOptionText,
                          formData.label === label && styles.labelOptionTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Full Address
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Enter your address"
                  placeholderTextColor="#999"
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={[styles.label, { color: Colors.light.text }]}>
                    City
                  </Text>
                  <TextInput
                    style={[styles.input, { color: Colors.light.text }]}
                    placeholder="City"
                    placeholderTextColor="#999"
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData({ ...formData, city: text })
                    }
                  />
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={[styles.label, { color: Colors.light.text }]}>
                    State
                  </Text>
                  <TextInput
                    style={[styles.input, { color: Colors.light.text }]}
                    placeholder="State"
                    placeholderTextColor="#999"
                    value={formData.state}
                    onChangeText={(text) =>
                      setFormData({ ...formData, state: text })
                    }
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Pincode
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Pincode"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={formData.pincode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, pincode: text })
                  }
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
                  value={formData.phoneNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phoneNumber: text })
                  }
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSaveAddress}>
                <Text style={styles.submitButtonText}>Save Address</Text>
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
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 16,
    color: '#999',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#f9f9f9',
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
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  labelOptionActive: {
    backgroundColor: '#35aeff',
    borderColor: '#35aeff',
  },
  labelOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  labelOptionTextActive: {
    color: 'white',
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
