import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { authService } from '../../src/services/authService';

interface Contact {
  name: string;
  relation?: string;
  phone?: string;
}

export default function TrustedContactsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contactInput, setContactInput] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);

  const handleNext = async () => {
    setLoading(true);
    try {
      await authService.updateUserProfile({
        trustedContacts: contacts,
      });
      router.push('/(auth)/complete');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    if (!contactInput.trim()) return;
    if (contacts.length >= 5) {
      Alert.alert("Limit Reached", "You can add up to 5 trusted contacts.");
      return;
    }
    setContacts([...contacts, { name: contactInput.trim() }]);
    setContactInput('');
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.loginRedirectContainer}>
          <Text style={styles.loginRedirectText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.loginRedirectLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Texts */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Add Your Trusted Contacts</Text>
          <Text style={styles.subtitle}>
            They will be notified and can help you during emergencies.
          </Text>
        </View>

        {/* Progress Stepper */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Complete */}
          <View style={styles.step}>
            <View style={[styles.stepIconContainer, styles.completedStepIcon]}>
              <Feather name="user" size={20} color="#F34E62" />
              <View style={styles.completedBadge}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.stepText, styles.activeStepText]}>Account</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 2: Complete */}
          <View style={styles.step}>
            <View style={[styles.stepIconContainer, styles.completedStepIcon]}>
              <Feather name="shield" size={18} color="#F34E62" />
              <View style={styles.completedBadge}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            </View>
            <Text style={[styles.stepText, styles.activeStepText]}>Safety Info</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 3: Active */}
          <View style={styles.step}>
            <View style={[styles.stepIconContainer, styles.activeStepIcon]}>
              <Feather name="users" size={18} color="#F34E62" />
            </View>
            <Text style={[styles.stepText, styles.activeStepText]}>Trusted Contacts</Text>
          </View>

          <View style={styles.stepperLine} />

          {/* Step 4: Pending */}
          <View style={styles.step}>
            <View style={styles.stepIconContainer}>
              <Feather name="check" size={18} color="#9CA3AF" />
            </View>
            <Text style={styles.stepText}>Complete</Text>
          </View>
        </View>

        {/* Section 1: Add Trusted Contacts Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Trusted Contacts</Text>
          <View style={styles.addInputContainer}>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color="#F34E62" style={styles.inputIconLeft} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter name or phone number"
                placeholderTextColor="#9CA3AF"
                value={contactInput}
                onChangeText={setContactInput}
              />
              <MaterialCommunityIcons name="contacts-outline" size={20} color="#6B7280" />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addContact}>
              <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>You can add up to 5 trusted contacts</Text>
        </View>

        {/* Section 2: Contact List */}
        <View style={styles.contactListCard}>
          {contacts.map((contact, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.contactItem}>
                <Image source={{ uri: `https://i.pravatar.cc/150?img=${(index % 10) + 1}` }} style={styles.avatar} />
                <View style={styles.contactDetails}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {index === 0 && (
                      <View style={styles.primaryBadge}>
                        <MaterialCommunityIcons name="star" size={12} color="#D97706" />
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  {contact.relation && <Text style={styles.contactRelation}>{contact.relation}</Text>}
                  {contact.phone && (
                    <View style={styles.contactPhoneRow}>
                      <Feather name="phone-call" size={12} color="#F34E62" />
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity style={styles.actionIconButton}>
                    <Feather name="message-circle" size={18} color="#F34E62" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionIconButton} onPress={() => removeContact(index)}>
                    <Feather name="trash-2" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
              </View>
            </React.Fragment>
          ))}
          {contacts.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#9CA3AF', padding: 20 }}>
              No trusted contacts added yet.
            </Text>
          )}
        </View>

        {/* Section 3: Emergency Message Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewIconWrapper}>
              <MaterialCommunityIcons name="message-alert-outline" size={20} color="#9061F9" />
            </View>
            <View style={styles.previewTexts}>
              <Text style={styles.previewTitle}>Emergency Message Preview</Text>
              <Text style={styles.previewSubtitle}>
                This message will be sent to your trusted contacts during an emergency.
              </Text>
            </View>
            <Feather name="chevron-down" size={20} color="#9061F9" />
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewAlertText}>🚨 EMERGENCY ALERT from [Your Name]</Text>
            <Text style={styles.previewBodyText}>I need help! My live location is being shared with you.</Text>
            <Text style={styles.previewBodyText}>Please contact me or the authorities immediately.</Text>
            <Text style={styles.previewTimeText}>Time: 12 May 2026, 9:41 AM</Text>
          </View>
        </View>

        {/* Section 4: Privacy Footer */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconWrapper}>
            <Feather name="shield" size={20} color="#10B981" />
          </View>
          <View style={styles.privacyTextContent}>
            <Text style={styles.privacyTitle}>Your privacy is protected</Text>
            <Text style={styles.privacyDesc}>
              Your contacts will only be notified during emergencies. We never share your data.
            </Text>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Complete Setup</Text>
              <Feather name="check" size={20} color="#FFFFFF" style={styles.buttonArrow} />
            </>
          )}
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.paginationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  loginRedirectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginRedirectText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginRedirectLink: {
    fontSize: 14,
    color: '#F34E62',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  step: {
    alignItems: 'center',
    width: 65,
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  activeStepIcon: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F34E62',
  },
  completedStepIcon: {
    backgroundColor: '#FFF0F2',
    borderColor: '#FFF0F2',
  },
  completedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#F34E62',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  activeStepText: {
    color: '#F34E62',
    fontWeight: '600',
  },
  stepperLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 25,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  addInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 10,
    height: 48,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactListCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
    marginLeft: 2,
  },
  contactRelation: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  contactPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactPhone: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 6,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  previewCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  previewIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewTexts: {
    flex: 1,
    paddingRight: 12,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B21A8',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  previewAlertText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  previewBodyText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  previewTimeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  privacyIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DEF7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  privacyTextContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  privacyDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  nextButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 24,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonArrow: {
    marginLeft: 8,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    backgroundColor: '#F34E62',
  },
});

