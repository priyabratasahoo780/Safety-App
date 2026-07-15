import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { authService } from '../../src/services/authService';
import { guardianService } from '../../src/services/guardianService';

export default function AddContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Family');
  const [safeSphereId, setSafeSphereId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveContact = async () => {
    if (!name && !safeSphereId) {
      Alert.alert('Error', 'Please enter a Name or a SafeSphere ID.');
      return;
    }
    if (!safeSphereId && !phone) {
      Alert.alert('Error', 'Please enter a Phone Number for manual contacts.');
      return;
    }

    setLoading(true);
    try {
      const cleanSafeSphereId = safeSphereId.trim().toUpperCase();

      if (cleanSafeSphereId) {
        // Send a request to the other user's app instead of statically saving it
        await guardianService.sendRequest(cleanSafeSphereId);
        
        Alert.alert('Request Sent!', `A Guardian request has been sent to ${cleanSafeSphereId}. You will be connected when they accept.`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Fallback: Save a manual SMS/WhatsApp contact without the app
        const profile = await authService.getUserProfile();
        const currentContacts = profile?.trustedContacts || [];

        const newContact = {
          name,
          phone,
          relation,
        };

        await authService.updateUserProfile({
          trustedContacts: [...currentContacts, newContact],
        });

        Alert.alert('Success', 'Manual SMS Guardian added successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add guardian.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 12 }}><Feather name="arrow-left" size={24} color="#111827" /></TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Guardian</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconContainer}>
            <Feather name="shield" size={48} color="#6D35E8" />
          </View>
          <Text style={styles.title}>New Emergency Guardian</Text>
          <Text style={styles.desc}>This person will automatically receive an SMS and WhatsApp message with your live location when you trigger an SOS.</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dad, Mom, John"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 99999 99999"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Family, Friend, Partner"
              value={relation}
              onChangeText={setRelation}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>SafeSphere ID (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="SSF-XXXX-XXXX"
              value={safeSphereId}
              onChangeText={setSafeSphereId}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleSaveContact}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>Save Guardian</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF0F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  content: { flex: 1, padding: 24 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    shadowColor: '#6D35E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#1F2937', textAlign: 'center' },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#4B5563', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtn: {
    backgroundColor: '#6D35E8',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#6D35E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
