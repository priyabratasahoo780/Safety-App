import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Contact {
  id: string;
  name: string;
  phone: string;
  isGuardian: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  
  // Trusted contacts state
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Rajesh (Dad)', phone: '+91 98300 12345', isGuardian: true },
    { id: '2', name: 'Anjali', phone: '+91 98311 54321', isGuardian: true }
  ]);
  
  // New contact form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Settings state
  const [smsFallback, setSmsFallback] = useState(true);
  const [bgTracking, setBgTracking] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [shakeTrigger, setShakeTrigger] = useState(true);

  // Load persistent data
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem('@safesphere_contacts');
        if (storedContacts) setContacts(JSON.parse(storedContacts));
        
        const settings = await AsyncStorage.getItem('@safesphere_settings');
        if (settings) {
          const parsed = JSON.parse(settings);
          setSmsFallback(parsed.smsFallback ?? true);
          setBgTracking(parsed.bgTracking ?? true);
          setPushNotif(parsed.pushNotif ?? true);
          setShakeTrigger(parsed.shakeTrigger ?? true);
        }
      } catch (e) {
        console.error('Failed to load profile data', e);
      }
    };
    loadData();
  }, []);

  // Save contacts
  useEffect(() => {
    AsyncStorage.setItem('@safesphere_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Save settings
  useEffect(() => {
    AsyncStorage.setItem('@safesphere_settings', JSON.stringify({
      smsFallback, bgTracking, pushNotif, shakeTrigger
    }));
  }, [smsFallback, bgTracking, pushNotif, shakeTrigger]);

  const handleAddContact = () => {
    if (!newName || !newPhone) {
      Alert.alert('Error', 'Please fill in both name and phone number.');
      return;
    }
    const newContact: Contact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      isGuardian: true
    };
    setContacts(prev => [...prev, newContact]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleLogOut = () => {
    router.replace('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <Text style={styles.profileName}>Ananya Bhattacharya</Text>
          <Text style={styles.profileDetails}>+91 98765 43210  •  ananya@email.com</Text>
        </View>

        {/* Trusted Contacts Manager */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trusted Guardians</Text>
            {!isAdding ? (
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => setIsAdding(true)}
              >
                <Feather name="plus" size={16} color="#6D28D9" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => setIsAdding(false)}
              >
                <Text style={[styles.addBtnText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {isAdding && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.formInput}
                placeholder="Guardian Name"
                placeholderTextColor="#9CA3AF"
                value={newName}
                onChangeText={setNewName}
              />
              <TextInput
                style={styles.formInput}
                placeholder="Phone Number (e.g. +91...)"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={newPhone}
                onChangeText={setNewPhone}
              />
              <TouchableOpacity style={styles.saveContactBtn} onPress={handleAddContact}>
                <Text style={styles.saveContactText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.contactsList}>
            {contacts.map(contact => (
              <View key={contact.id} style={styles.contactRow}>
                <View style={styles.contactInfo}>
                  <View style={styles.miniAvatar}>
                    <Text style={styles.miniAvatarText}>
                      {contact.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Emergency Triggers Settings */}
        <Text style={styles.sectionLabel}>Emergency Settings</Text>
        
        <View style={styles.sectionCard}>
          {/* Shake Trigger */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Shake to Trigger SOS</Text>
              <Text style={styles.settingDesc}>Trigger alarms by shaking device vigorously</Text>
            </View>
            <Switch
              value={shakeTrigger}
              onValueChange={setShakeTrigger}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={shakeTrigger ? '#6D28D9' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.separator} />

          {/* SMS Fallback */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>SMS Fallback Offline</Text>
              <Text style={styles.settingDesc}>Send text alerts if data connectivity is lost</Text>
            </View>
            <Switch
              value={smsFallback}
              onValueChange={setSmsFallback}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={smsFallback ? '#6D28D9' : '#F3F4F6'}
            />
          </View>

          <View style={styles.separator} />

          {/* Background Live Location Tracking */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Background Location Sharing</Text>
              <Text style={styles.settingDesc}>Allow background pings during active journeys</Text>
            </View>
            <Switch
              value={bgTracking}
              onValueChange={setBgTracking}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={bgTracking ? '#6D28D9' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* General Preferences */}
        <Text style={styles.sectionLabel}>Preferences</Text>

        <View style={styles.sectionCard}>
          {/* Push Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive warnings and verification alerts</Text>
            </View>
            <Switch
              value={pushNotif}
              onValueChange={setPushNotif}
              trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
              thumbColor={pushNotif ? '#6D28D9' : '#F3F4F6'}
            />
          </View>

          <View style={styles.separator} />

          {/* AI Safety Analysis */}
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => router.push('/(drawer)/(tabs)/safety-analysis')}
          >
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>AI Safety Analysis</Text>
              <Text style={styles.settingDesc}>View your personalized safety overview</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Language Selection */}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDesc}>English (United States)</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version spacer */}
        <Text style={styles.versionText}>SafeSphere AI • Version 1.0.0 (Production MVP)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 15,
  },
  profileDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addBtnText: {
    fontSize: 13,
    color: '#6D28D9',
    fontWeight: '700',
  },
  addForm: {
    backgroundColor: '#FAF9FC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    gap: 10,
  },
  formInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#1F2937',
  },
  saveContactBtn: {
    backgroundColor: '#6D28D9',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveContactText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  contactsList: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 14,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingTextContent: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

