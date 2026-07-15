import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { authService } from '../../src/services/authService';
import { guardianService } from '../../src/services/guardianService';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../src/config/firebaseConfig';

export default function ManageGuardiansScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [manualContacts, setManualContacts] = useState<any[]>([]);
  const [appConnections, setAppConnections] = useState<any[]>([]);

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    try {
      setLoading(true);
      const profile = await authService.getUserProfile();
      if (!profile) return;
      
      setManualContacts(profile.trustedContacts || []);

      // Fetch App connections where we are the protected user
      const q = query(
        collection(db, 'guardianConnections'),
        where('protectedUserId', '==', profile.uid)
      );
      const snap = await getDocs(q);
      const conns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppConnections(conns);

    } catch (error) {
      console.error('Error fetching guardians:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeManualContact = async (index: number) => {
    Alert.alert('Remove Contact', 'Are you sure you want to remove this manual guardian?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            const newContacts = [...manualContacts];
            newContacts.splice(index, 1);
            await authService.updateUserProfile({ trustedContacts: newContacts });
            setManualContacts(newContacts);
          } catch (e) {
            Alert.alert('Error', 'Could not remove contact');
          } finally {
            setLoading(false);
          }
      }}
    ]);
  };

  const removeAppConnection = async (docId: string) => {
    Alert.alert('Remove Guardian', 'Are you sure you want to remove this SafeSphere guardian?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await deleteDoc(doc(db, 'guardianConnections', docId));
            await fetchGuardians();
          } catch (e) {
            Alert.alert('Error', 'Could not remove connection');
          } finally {
            setLoading(false);
          }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Guardians</Text>
        <TouchableOpacity onPress={() => router.push('/add-contact')} style={{ padding: 8 }}>
          <Feather name="plus" size={24} color="#6D35E8" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6D35E8" style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SafeSphere Connected Guardians</Text>
              <Text style={styles.sectionDesc}>These guardians will receive real-time live tracking and push notifications during an SOS.</Text>
              
              {appConnections.length === 0 ? (
                <Text style={styles.emptyText}>No connected app guardians yet.</Text>
              ) : (
                appConnections.map((conn) => (
                  <View key={conn.id} style={styles.card}>
                    <View style={styles.cardInfo}>
                      <View style={styles.avatar}>
                        <Feather name="shield" size={20} color="#6D35E8" />
                      </View>
                      <View>
                        <Text style={styles.nameText}>{conn.guardianName || 'Connected Guardian'}</Text>
                        <Text style={styles.statusText}>{conn.status === 'active' ? 'Active Monitoring' : conn.status}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeAppConnection(conn.id)} style={styles.deleteBtn}>
                      <Feather name="trash-2" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manual SMS Contacts</Text>
              <Text style={styles.sectionDesc}>These contacts will receive an SMS fallback if connected guardians fail.</Text>
              
              {manualContacts.length === 0 ? (
                <Text style={styles.emptyText}>No manual contacts added.</Text>
              ) : (
                manualContacts.map((contact, idx) => (
                  <View key={idx} style={styles.card}>
                    <View style={styles.cardInfo}>
                      <View style={[styles.avatar, { backgroundColor: '#FEE2E2' }]}>
                        <Feather name="phone" size={20} color="#EF4444" />
                      </View>
                      <View>
                        <Text style={styles.nameText}>{contact.name}</Text>
                        <Text style={styles.subText}>{contact.relation} • {contact.phone}</Text>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => removeManualContact(idx)} style={styles.deleteBtn}>
                      <Feather name="trash-2" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  content: { padding: 20, paddingBottom: 100 },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5D5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
  }
});
