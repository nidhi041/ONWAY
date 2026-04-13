import { Colors } from '@/constants/theme';
import { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'Orders',
    question: 'How can I track my order?',
    answer: 'You can track your order in real-time from the "My Orders" section in your profile. Look for the order you want to track and tap it to see the delivery status.',
    icon: '📦',
  },
  {
    id: '2',
    category: 'Orders',
    question: 'Can I cancel my order?',
    answer: 'You can cancel orders within 30 minutes of placing them. After that, the order is confirmed and cannot be cancelled. Contact our support team for further assistance.',
    icon: '❌',
  },
  {
    id: '3',
    category: 'Delivery',
    question: 'What is the delivery time?',
    answer: 'Most orders are delivered within 30-45 minutes. Delivery times may vary depending on your location and order complexity. You will receive real-time updates.',
    icon: '⏱️',
  },
  {
    id: '4',
    category: 'Delivery',
    question: 'Do you charge for delivery?',
    answer: 'Delivery charges vary by location and order value. Orders above ₹500 may qualify for free delivery. Check the delivery fee at checkout.',
    icon: '💰',
  },
  {
    id: '5',
    category: 'Returns',
    question: 'Can I return products?',
    answer: 'Products can be returned within 7 days of delivery if they are unused and in original packaging. Contact our support team to initiate a return.',
    icon: '↩️',
  },
  {
    id: '6',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and tap "Forgot Password". Enter your email address and follow the instructions sent to your email to reset your password.',
    icon: '🔑',
  },
];

interface ContactMethod {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  type: 'phone' | 'email' | 'chat' | 'web';
}

const CONTACT_METHODS: ContactMethod[] = [
  {
    id: '1',
    title: 'Call Us',
    description: '+91 1234567890',
    icon: '📞',
    action: 'tel:+911234567890',
    type: 'phone',
  },
  {
    id: '2',
    title: 'Email Us',
    description: 'support@onway.com',
    icon: '✉️',
    action: 'mailto:support@onway.com',
    type: 'email',
  },
  {
    id: '3',
    title: 'Live Chat',
    description: 'Chat with us instantly',
    icon: '💬',
    action: 'chat',
    type: 'chat',
  },
  {
    id: '4',
    title: 'Visit Website',
    description: 'Help center & FAQs',
    icon: '🌐',
    action: 'https://onway.com/help',
    type: 'web',
  },
];

const FAQCard = ({ item, onPress }: { item: FAQItem; onPress: (item: FAQItem) => void }) => (
  <TouchableOpacity style={styles.faqCard} onPress={() => onPress(item)}>
    <View style={styles.faqContent}>
      <Text style={styles.faqIcon}>{item.icon}</Text>
      <View style={styles.faqText}>
        <Text style={styles.faqCategory}>{item.category}</Text>
        <Text style={[styles.faqQuestion, { color: Colors.light.text }]}>
          {item.question}
        </Text>
      </View>
    </View>
    <Text style={styles.faqArrow}>›</Text>
  </TouchableOpacity>
);

const ContactCard = ({
  method,
  onPress,
}: {
  method: ContactMethod;
  onPress: (method: ContactMethod) => void;
}) => (
  <TouchableOpacity style={styles.contactCard} onPress={() => onPress(method)}>
    <View style={styles.contactIconContainer}>
      <Text style={styles.contactIcon}>{method.icon}</Text>
    </View>
    <View style={styles.contactContent}>
      <Text style={[styles.contactTitle, { color: Colors.light.text }]}>
        {method.title}
      </Text>
      <Text style={styles.contactDescription}>{method.description}</Text>
    </View>
    <Text style={styles.contactArrow}>›</Text>
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { id: string; text: string; sender: 'user' | 'support' }[]
  >([
    {
      id: '1',
      text: 'Hello! How can we help you today?',
      sender: 'support',
    },
  ]);

  const handleFAQPress = (item: FAQItem) => {
    setExpandedFAQ(expandedFAQ === item.id ? null : item.id);
  };

  const handleContactPress = (method: ContactMethod) => {
    switch (method.type) {
      case 'phone':
        Linking.openURL(method.action).catch(() =>
          Alert.alert('Error', 'Unable to open phone dialer')
        );
        break;
      case 'email':
        Linking.openURL(method.action).catch(() =>
          Alert.alert('Error', 'Unable to open email client')
        );
        break;
      case 'chat':
        setChatModalVisible(true);
        break;
      case 'web':
        Linking.openURL(method.action).catch(() =>
          Alert.alert('Error', 'Unable to open website')
        );
        break;
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user' as const,
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatMessage('');

    // Simulate support response
    setTimeout(() => {
      const supportMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for your message! Our team will respond shortly.',
        sender: 'support' as const,
      };
      setChatMessages((prev) => [...prev, supportMessage]);
    }, 1000);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerIcon}>🆘</Text>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
              Help & Support
            </Text>
            <Text style={styles.headerSubtitle}>
              We're here to help you. Find answers or contact us.
            </Text>
          </View>

          {/* Contact Methods */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              CONTACT US
            </Text>
            <View style={styles.contactGrid}>
              {CONTACT_METHODS.map((method) => (
                <ContactCard
                  key={method.id}
                  method={method}
                  onPress={handleContactPress}
                />
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
              FREQUENTLY ASKED QUESTIONS
            </Text>
            {FAQ_DATA.map((item) => (
              <FAQCard
                key={item.id}
                item={item}
                onPress={handleFAQPress}
              />
            ))}

            {expandedFAQ && (
              <View style={styles.expandedAnswer}>
                <Text style={styles.answerText}>
                  {FAQ_DATA.find((item) => item.id === expandedFAQ)?.answer}
                </Text>
              </View>
            )}
          </View>

          {/* Additional Help */}
          <View style={styles.additionalSection}>
            <View style={styles.helpTip}>
              <Text style={styles.helpTipIcon}>💡</Text>
              <View style={styles.helpTipContent}>
                <Text style={[styles.helpTipTitle, { color: Colors.light.text }]}>
                  Quick Tips
                </Text>
                <Text style={styles.helpTipText}>
                  Most issues can be resolved quickly. Check our FAQ section first!
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Live Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatModalVisible}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <View style={styles.chatModalOverlay}>
          <View style={styles.chatModalContent}>
            {/* Chat Header */}
            <View style={styles.chatHeader}>
              <Text style={[styles.chatTitle, { color: Colors.light.text }]}>
                Live Chat Support
              </Text>
              <TouchableOpacity onPress={() => setChatModalVisible(false)}>
                <Text style={styles.chatCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView style={styles.chatMessages}>
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user'
                      ? styles.userMessage
                      : styles.supportMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sender === 'user'
                        ? styles.userMessageText
                        : styles.supportMessageText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Chat Input */}
            <View style={styles.chatInputContainer}>
              <TextInput
                style={[styles.chatInput, { color: Colors.light.text }]}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Text style={styles.sendButtonIcon}>➤</Text>
              </TouchableOpacity>
            </View>
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
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1,
  },
  contactGrid: {
    gap: 8,
  },
  contactCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactIcon: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: '#999',
  },
  contactArrow: {
    fontSize: 20,
    color: '#35aeff',
    fontWeight: '600',
  },
  faqCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  faqIcon: {
    fontSize: 20,
  },
  faqText: {
    flex: 1,
  },
  faqCategory: {
    fontSize: 11,
    color: '#35aeff',
    fontWeight: '600',
    marginBottom: 2,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '500',
  },
  faqArrow: {
    fontSize: 20,
    color: '#35aeff',
    fontWeight: '600',
  },
  expandedAnswer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  answerText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  additionalSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  helpTip: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  helpTipIcon: {
    fontSize: 24,
  },
  helpTipContent: {
    flex: 1,
  },
  helpTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  helpTipText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 20,
  },
  chatModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chatModalContent: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chatCloseButton: {
    fontSize: 24,
    color: '#666',
  },
  chatMessages: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    marginVertical: 6,
    maxWidth: '85%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#35aeff',
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  userMessageText: {
    color: 'white',
  },
  supportMessageText: {
    color: '#333',
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'white',
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f5f5f5',
    maxHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#35aeff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
