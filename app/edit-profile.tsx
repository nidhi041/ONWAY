import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take a Picture',
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert('Permission needed', 'Camera permission is required to take a picture.');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setImageUri(result.assets[0].uri);
              setRemovePhoto(false);
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setImageUri(result.assets[0].uri);
              setRemovePhoto(false);
            }
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const uploadImageToCloudinary = async (uri: string) => {
    try {
      const data = new FormData();
      data.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);
      data.append('upload_preset', 'velzo-app');
      data.append('cloud_name', 'dhjzybacp');

      const response = await fetch('https://api.cloudinary.com/v1_1/dhjzybacp/image/upload', {
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || 'Failed to upload image to Cloudinary');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = undefined;
      
      if (removePhoto) {
        avatarUrl = ''; // We use empty string to signify removal
      } else if (imageUri) {
        avatarUrl = await uploadImageToCloudinary(imageUri);
      }

      await updateUserProfile(name, avatarUrl);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const currentAvatar = user?.avatar?.startsWith('http') ? user.avatar : null;
  const displayImage = removePhoto ? null : (imageUri || currentAvatar);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Photo Editor */}
          <View style={styles.imageSection}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
              {displayImage ? (
                <Image 
                  source={{ uri: displayImage }} 
                  style={styles.profileImage} 
                  cachePolicy="memory-disk" 
                  contentFit="cover" 
                  transition={200} 
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={60} color="#0C63E4" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>📷</Text>
              </View>
            </TouchableOpacity>
            
            {displayImage ? (
              <TouchableOpacity onPress={() => { setImageUri(null); setRemovePhoto(true); }} style={styles.removePhotoButton}>
                <Text style={styles.removePhotoText}>Remove Photo</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.imageHelpText}>Tap to add profile photo</Text>
            )}
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { color: Colors.light.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: Colors.light.text }]}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput, { color: '#888' }]}
                value={user?.email || ''}
                editable={false}
              />
              <Text style={styles.helperText}>Email address cannot be changed</Text>
            </View>
          </View>

        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  placeholder: {
    width: 40,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#0C63E4',
  },
  placeholderImage: {
    backgroundColor: '#F5F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#E8F1FF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0C63E4',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editIcon: {
    fontSize: 16,
    color: '#fff',
  },
  removePhotoButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  removePhotoText: {
    fontSize: 14,
    color: '#FF4757',
    fontWeight: '700',
  },
  imageHelpText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 8,
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {},
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    opacity: 0.8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#0C63E4',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
