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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { authService } from '../../../src/services/authService';
import { useGuardianConnections } from '../../../features/guardian/hooks/useGuardianConnections';
import { guardianService } from '../../../features/guardian/services/guardianService';

interface Contact {
  id: string;
  name: string;
  phone: string;
  isGuardian: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // New contact form state
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Manual Contact State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const {
    pendingIncoming,
    pendingOutgoing,
    activeConnections,
    guardianProfiles,
    sendRequest,
    acceptRequest,
    rejectRequest,
  } = useGuardianConnections(user?.id || null);

  const handleSearchGuardian = async () => {
    setSearchError('');
    setSearchResult(null);
    if (!searchId.trim()) return;
    try {
      const res = await guardianService.searchUserBySafeSphereId(searchId);
      if (res) {
        if (res.uid === user?.id) {
          setSearchError("You cannot connect to yourself.");
        } else {
          setSearchResult(res);
        }
      } else {
        setSearchError("No user found with this ID.");
      }
    } catch (e: any) {
      setSearchError(e.message);
    }
  };

  const handleSendRequest = async () => {
    if (!searchResult || !user?.id) return;
    try {
      await sendRequest(searchResult.uid, userProfile?.fullName || 'A User');
      Alert.alert('Success', 'Guardian Request sent!');
      setSearchResult(null);
      setSearchId('');
      setIsAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Settings state
  const [smsFallback, setSmsFallback] = useState(true);
  const [bgTracking, setBgTracking] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [shakeTrigger, setShakeTrigger] = useState(true);

  // Load persistent data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user?.id) return;
        const profile = await authService.getUserProfile(user.id);
        if (profile) {
          setUserProfile(profile);
          if (profile.trustedContacts) {
            setContacts(profile.trustedContacts);
          }
        }

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
    if (userProfile && user?.id) {
      authService.updateUserProfile(user.id, { trustedContacts: contacts }).catch(e => console.log('Sync err', e));
    }
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
    Alert.alert('Success', 'Manual contact added for SMS fallback!');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleLogOut = async () => {
    try {
      await authService.logout();
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (e) {
      Alert.alert('Log out failed', 'Could not log out.');
    }
  };

  const handleEditProfile = () => {
    setEditFullName(userProfile?.fullName || '');
    setEditPhone(userProfile?.phone || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;
      await authService.updateUserProfile(user.id, {
        fullName: editFullName,
        phone: editPhone
      });
      setUserProfile((prev: any) => ({ ...prev, fullName: editFullName, phone: editPhone }));
      setIsEditingProfile(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const copyToClipboard = async () => {
    if (userProfile?.safeSphereId) {
      await Clipboard.setStringAsync(userProfile.safeSphereId);
      Alert.alert('Copied!', 'SafeSphere ID copied to clipboard.');
    }
  };

  const shareSafeSphereId = async () => {
    if (userProfile?.safeSphereId) {
      try {
        await Share.share({
          message: `Connect with me on SafeSphere! My Guardian ID is: ${userProfile.safeSphereId}`,
        });
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
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
            <Text style={styles.avatarText}>
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          {isEditingProfile ? (
            <View style={{ width: '100%', alignItems: 'center', marginTop: 10 }}>
              <TextInput
                style={[styles.formInput, { width: '80%', textAlign: 'center', marginBottom: 10 }]}
                placeholder="Full Name"
                value={editFullName}
                onChangeText={setEditFullName}
              />
              <TextInput
                style={[styles.formInput, { width: '80%', textAlign: 'center', marginBottom: 15 }]}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={editPhone}
                onChangeText={setEditPhone}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.saveContactBtn} onPress={handleSaveProfile}>
                  <Text style={styles.saveContactText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveContactBtn, { backgroundColor: '#F3F4F6' }]} 
                  onPress={() => setIsEditingProfile(false)}
                >
                  <Text style={[styles.saveContactText, { color: '#EF4444' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.profileName}>{userProfile?.fullName || 'User Profile'}</Text>
                <TouchableOpacity onPress={handleEditProfile} style={{ marginLeft: 8 }}>
                  <Feather name="edit-2" size={16} color="#6D28D9" />
                </TouchableOpacity>
              </View>
              <Text style={styles.profileDetails}>
                {(userProfile?.phone || userProfile?.email) ?
                  `${userProfile?.phone || 'No phone'}  •  ${userProfile?.email || 'No email'}`
                  : 'Add contact details'}
              </Text>
            </>
          )}
        </View>

        {/* SafeSphere ID Card */}
        {userProfile?.safeSphereId && (
          <View style={[styles.sectionCard, { backgroundColor: '#6D28D9', borderColor: '#6D28D9' }]}>
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                My SafeSphere ID
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 3, marginBottom: 16 }}>
                {userProfile.safeSphereId}
              </Text>
              <Text style={{ color: '#C4B5FD', fontSize: 12, textAlign: 'center', marginBottom: 20, paddingHorizontal: 10, lineHeight: 18 }}>
                Share this ID only with people you trust. They can use it to send you a Guardian connection request.
              </Text>
              
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity 
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={copyToClipboard}
                >
                  <Feather name="copy" size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Copy ID</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                  onPress={shareSafeSphereId}
                >
                  <Feather name="share" size={16} color="#6D28D9" />
                  <Text style={{ color: '#6D28D9', fontWeight: '700', fontSize: 14 }}>Share ID</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Trusted Contacts Manager */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guardian Connections</Text>
            {!isAdding ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setIsAdding(true)}
              >
                <Feather name="plus" size={16} color="#6D28D9" />
                <Text style={styles.addBtnText}>Connect</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setIsAdding(false);
                  setSearchResult(null);
                  setSearchId('');
                  setNewName('');
                  setNewPhone('');
                }}
              >
                <Text style={[styles.addBtnText, { color: '#EF4444' }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {isAdding && (
            <View style={styles.addForm}>
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>1. Connect via SafeSphere ID (Recommended)</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 10 }}>Search for a user by their SafeSphere ID (e.g. SSF-XXXX-XXXX) to send an App Guardian request.</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
                  placeholder="Enter Guardian ID"
                  placeholderTextColor="#9CA3AF"
                  value={searchId}
                  onChangeText={setSearchId}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={[styles.saveContactBtn, { paddingHorizontal: 15, marginTop: 0 }]} onPress={handleSearchGuardian}>
                  <Text style={styles.saveContactText}>Find</Text>
                </TouchableOpacity>
              </View>

              {searchError ? (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 10 }}>{searchError}</Text>
              ) : null}

              {searchResult && (
                <View style={{ marginTop: 15, padding: 15, backgroundColor: 'rgba(109,40,217,0.1)', borderRadius: 12, borderWidth: 1, borderColor: '#6D28D9' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>{searchResult.fullName}</Text>
                  <Text style={{ color: '#C4B5FD', fontSize: 12, marginTop: 4 }}>ID: {searchResult.safeSphereId}</Text>
                  
                  <TouchableOpacity style={[styles.saveContactBtn, { marginTop: 15 }]} onPress={handleSendRequest}>
                    <Text style={styles.saveContactText}>Send Guardian Request</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ height: 1, backgroundColor: '#374151', marginVertical: 25 }} />

              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>2. Add Manual Contact (For SMS Fallback)</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 15 }}>Add a phone number to send automated SMS alerts during an emergency.</Text>
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
                <Text style={styles.saveContactText}>Save Manual Contact</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pending Incoming Requests */}
          {pendingIncoming.length > 0 && (
            <View style={{ marginTop: 15 }}>
              <Text style={{ color: '#C4B5FD', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' }}>Pending Requests</Text>
              {pendingIncoming.map((req) => (
                <View key={req.id} style={[styles.contactRow, { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: '#F59E0B', borderWidth: 1 }]}>
                  <View style={styles.contactInfo}>
                    <View style={[styles.miniAvatar, { backgroundColor: '#F59E0B' }]}>
                      <Text style={styles.miniAvatarText}>{req.requesterName?.charAt(0) || '?'}</Text>
                    </View>
                    <View>
                      <Text style={styles.contactName}>{req.requesterName || 'Unknown'}</Text>
                      <Text style={styles.contactPhone}>ID: {guardianProfiles[req.requesterUserId]?.safeSphereId || 'Unknown'} • Wants to connect</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => rejectRequest(req.id)}>
                      <Feather name="x-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => acceptRequest(req.id, req.requesterUserId)}>
                      <Feather name="check-circle" size={24} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Active Guardian Connections */}
          <View style={[styles.contactsList, { marginTop: pendingIncoming.length > 0 ? 20 : 10 }]}>
            <Text style={{ color: '#C4B5FD', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' }}>My Guardians</Text>
            
            {activeConnections.length === 0 ? (
              <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic', paddingVertical: 10 }}>No Guardians connected yet.</Text>
            ) : (
              activeConnections.map((conn) => {
                const profile = guardianProfiles[conn.guardianUserId] || {};
                const name = profile.fullName || 'Guardian';
                return (
                  <View key={conn.id} style={styles.contactRow}>
                    <View style={styles.contactInfo}>
                      <View style={[styles.miniAvatar, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.miniAvatarText}>{name.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={styles.contactName}>{name}</Text>
                        <Text style={styles.contactPhone}>ID: {profile.safeSphereId || 'Unknown'}</Text>
                      </View>
                    </View>
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: 'bold' }}>• Active</Text>
                  </View>
                );
              })
            )}
          </View>
          {/* Manual Contacts (Legacy) */}
          {contacts.length > 0 && (
            <View style={[styles.contactsList, { marginTop: 20 }]}>
              <Text style={{ color: '#C4B5FD', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' }}>Manual SMS Contacts</Text>
              {contacts.map((contact, index) => (
                <View key={contact.id || `contact-${index}`} style={styles.contactRow}>
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
          )}
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
            onPress={() => router.push('/(drawer)/safety-analysis')}
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

