import { Colors } from '@/constants/theme';
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

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  type: 'toggle' | 'action';
}

const DEFAULT_SETTINGS: SecuritySetting[] = [
  {
    id: '1',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    icon: '🔐',
    enabled: false,
    type: 'toggle',
  },
  {
    id: '2',
    title: 'Biometric Login',
    description: 'Use fingerprint or face recognition to login',
    icon: '👆',
    enabled: true,
    type: 'toggle',
  },
  {
    id: '3',
    title: 'Change Password',
    description: 'Update your account password',
    icon: '🔑',
    enabled: false,
    type: 'action',
  },
  {
    id: '4',
    title: 'Login Activity',
    description: 'View all active sessions and devices',
    icon: '📱',
    enabled: false,
    type: 'action',
  },
];

const SettingCard = ({
  setting,
  onToggle,
  onPress,
}: {
  setting: SecuritySetting;
  onToggle: (id: string) => void;
  onPress: (id: string) => void;
}) => (
  <TouchableOpacity
    style={styles.settingCard}
    onPress={() => setting.type === 'action' && onPress(setting.id)}
  >
    <View style={styles.settingContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.settingIcon}>{setting.icon}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.settingTitle, { color: Colors.light.text }]}>
          {setting.title}
        </Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
      </View>

      {setting.type === 'toggle' && (
        <TouchableOpacity
          style={[
            styles.toggle,
            setting.enabled && styles.toggleEnabled,
          ]}
          onPress={() => onToggle(setting.id)}
        >
          <View
            style={[
              styles.toggleDot,
              setting.enabled && styles.toggleDotEnabled,
            ]}
          />
        </TouchableOpacity>
      )}

      {setting.type === 'action' && (
        <Text style={styles.arrow}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function PrivacySecurityScreen() {
  const [settings, setSettings] = useState<SecuritySetting[]>(DEFAULT_SETTINGS);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleToggle = (id: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleActionPress = (id: string) => {
    switch (id) {
      case '3':
        setPasswordModalVisible(true);
        break;
      case '4':
        setActivityModalVisible(true);
        break;
      default:
        break;
    }
  };

  const handleChangePassword = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    Alert.alert('Success', 'Password changed successfully');
    setPasswordModalVisible(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const mockLoginActivity = [
    {
      id: '1',
      device: 'iPhone 14 Pro',
      location: 'New Delhi, India',
      lastActive: 'Active now',
      time: '10:30 AM',
    },
    {
      id: '2',
      device: 'Chrome on Windows',
      location: 'New Delhi, India',
      lastActive: '2 hours ago',
      time: '8:15 AM',
    },
    {
      id: '3',
      device: 'Safari on iPad',
      location: 'Bangalore, India',
      lastActive: '1 day ago',
      time: 'Yesterday',
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoIcon}>🛡️</Text>
            <Text style={[styles.infoTitle, { color: Colors.light.text }]}>
              Account Security
            </Text>
            <Text style={styles.infoText}>
              Manage your account security settings and keep your account safe
            </Text>
          </View>

          {/* Security Settings */}
          <View style={styles.settingsContainer}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              SECURITY SETTINGS
            </Text>
            {settings.map((setting) => (
              <SettingCard
                key={setting.id}
                setting={setting}
                onToggle={handleToggle}
                onPress={handleActionPress}
              />
            ))}
          </View>

          {/* Password Tips */}
          <View style={styles.tipsSection}>
            <Text style={[styles.tipsTitle, { color: Colors.light.text }]}>
              Password Tips
            </Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Use at least 8 characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Mix uppercase and lowercase letters</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Include numbers and special characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Never share your password with anyone</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Current Password
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Enter current password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                  value={passwordForm.currentPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, currentPassword: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  New Password
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                  value={passwordForm.newPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, newPassword: text })
                  }
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors.light.text }]}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={[styles.input, { color: Colors.light.text }]}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  secureTextEntry={true}
                  value={passwordForm.confirmPassword}
                  onChangeText={(text) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: text })
                  }
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleChangePassword}
              >
                <Text style={styles.submitButtonText}>Update Password</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Login Activity Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={activityModalVisible}
        onRequestClose={() => setActivityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.light.text }]}>
                Login Activity
              </Text>
              <TouchableOpacity onPress={() => setActivityModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: Colors.light.text },
                ]}
              >
                Active Sessions
              </Text>

              {mockLoginActivity.map((activity) => (
                <View key={activity.id} style={styles.activityCard}>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDevice}>📱 {activity.device}</Text>
                    <Text style={styles.activityLocation}>
                      📍 {activity.location}
                    </Text>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityStatus}>{activity.lastActive}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                  {activity.lastActive === 'Active now' && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity
                style={[styles.submitButton, styles.submitButtonDanger]}
              >
                <Text style={styles.submitButtonTextDanger}>
                  Logout All Other Sessions
                </Text>
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
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleEnabled: {
    backgroundColor: '#4CAF50',
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleDotEnabled: {
    alignSelf: 'flex-end',
  },
  arrow: {
    fontSize: 20,
    color: '#35aeff',
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 16,
    backgroundColor: '#f0f8ff',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  tipBullet: {
    fontSize: 12,
    color: '#35aeff',
    fontWeight: '700',
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
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
  submitButtonDanger: {
    backgroundColor: '#f5f5f5',
  },
  submitButtonTextDanger: {
    color: '#666',
    fontSize: 15,
    fontWeight: '700',
  },
  activitySubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityDevice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  activityStatus: {
    fontSize: 11,
    color: '#35aeff',
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 20,
  },
});
