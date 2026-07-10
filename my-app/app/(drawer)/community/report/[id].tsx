import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function IncidentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock database (in a real app, you'd fetch this from your backend)
  const incidentsDb = [
    {
      id: '1',
      category: 'Poor Lighting',
      location: 'Near Salt Lake Sector V Metro Station',
      time: '2 hours ago',
      description: 'Streetlights under the metro bridge are completely broken. Extremely dark walking path after 8 PM.',
      votes: 18,
      verified: true,
    },
    {
      id: '2',
      category: 'Harassment',
      location: 'Block GP, Sector V',
      time: '1 day ago',
      description: 'Group of men loitering near the tea stall catcalling women walking past towards office complexes.',
      votes: 34,
      verified: true,
    },
    {
      id: '3',
      category: 'Suspicious Activity',
      location: 'Sector 3 Park Lane',
      time: '3 days ago',
      description: 'Unmarked van parked near the playground gates for multiple nights. Drivers watching passersby.',
      votes: 8,
      verified: false,
    }
  ];

  // Find the exact incident they clicked on, or fallback to a default if not found
  const incident = incidentsDb.find(inc => inc.id === id) || incidentsDb[1];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Harassment': return '#EF4444';
      case 'Poor Lighting': return '#F59E0B';
      case 'Suspicious Activity': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Details</Text>
        <View style={{ width: 40 }} /> {/* Spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(incident.category) + '15' }]}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(incident.category) }]} />
          <Text style={[styles.categoryText, { color: getCategoryColor(incident.category) }]}>{incident.category}</Text>
        </View>

        <Text style={styles.title}>{incident.location}</Text>
        
        <View style={styles.metaRow}>
          <Feather name="clock" size={14} color="#6B7280" />
          <Text style={styles.timeText}>Reported {incident.time}</Text>
        </View>

        {incident.verified && (
          <View style={styles.verifiedAlert}>
            <Feather name="shield" size={20} color="#16A34A" />
            <Text style={styles.verifiedAlertText}>This incident has been verified by multiple community members.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{incident.description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Community Response</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{incident.votes}</Text>
            <Text style={styles.statLabel}>Upvotes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    padding: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  verifiedAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  verifiedAlertText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
