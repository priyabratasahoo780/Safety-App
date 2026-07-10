import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface IncidentData {
  id: string;
  category: string;
  location: string;
  time: string;
  description: string;
  votes: number;
  aiClassification: {
    class: string;
    confidence: string;
    verified: boolean;
  };
  reporter: string;
}

export default function ReportDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [votes, setVotes] = useState(24);
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null);

  // Mock lookup data
  const incident: IncidentData = {
    id: (id as string) || '1',
    category: 'Poor Lighting',
    location: 'Near Salt Lake Sector V Metro Station',
    time: '2 hours ago',
    description: 'Streetlights under the metro bridge are completely broken. Extremely dark walking path after 8 PM. It makes commuters walking towards the buses or cabs feel unsafe.',
    votes: votes,
    aiClassification: {
      class: 'Safety Hazard (Infrastructure)',
      confidence: '98%',
      verified: true,
    },
    reporter: 'Ananya B. (Verified User)'
  };

  const handleVote = (type: 'up' | 'down') => {
    if (myVote === type) {
      setVotes(prev => prev + (type === 'up' ? -1 : 1));
      setMyVote(null);
    } else {
      const prevChange = myVote === 'up' ? -1 : myVote === 'down' ? 1 : 0;
      const newChange = type === 'up' ? 1 : -1;
      setVotes(prev => prev + prevChange + newChange);
      setMyVote(type);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Incident Summary Card */}
        <View style={styles.card}>
          <View style={styles.tagRow}>
            <View style={styles.categoryTag}>
              <View style={styles.categoryDot} />
              <Text style={styles.categoryText}>{incident.category}</Text>
            </View>
            <View style={styles.timeTag}>
              <Text style={styles.timeText}>{incident.time}</Text>
            </View>
          </View>

          <Text style={styles.locationTitle}>{incident.location}</Text>
          <Text style={styles.reporterName}>Reported by {incident.reporter}</Text>

          <View style={styles.divider} />

          <Text style={styles.descriptionLabel}>DESCRIPTION</Text>
          <Text style={styles.descriptionText}>{incident.description}</Text>
        </View>

        {/* AI Analysis Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="robot" size={20} color="#6D28D9" />
            <Text style={styles.aiTitle}>Gemini AI Moderation</Text>
            <View style={styles.aiStatusBadge}>
              <Text style={styles.aiStatusText}>CLASSIFIED</Text>
            </View>
          </View>
          
          <View style={styles.aiMetrics}>
            <View style={styles.aiMetricItem}>
              <Text style={styles.aiMetricLabel}>Risk Category</Text>
              <Text style={styles.aiMetricValue}>{incident.aiClassification.class}</Text>
            </View>
            <View style={styles.aiMetricItem}>
              <Text style={styles.aiMetricLabel}>Gemini Confidence</Text>
              <Text style={styles.aiMetricValue}>{incident.aiClassification.confidence}</Text>
            </View>
          </View>

          <View style={styles.aiCallout}>
            <Feather name="check-circle" size={14} color="#16A34A" style={{ marginRight: 6 }} />
            <Text style={styles.aiCalloutText}>
              Verified matching other reports in this geofence area.
            </Text>
          </View>
        </View>

        {/* Draggable/Visual Map pin */}
        <Text style={styles.sectionTitle}>Geographic Location</Text>
        <View style={styles.mapCard}>
          <View style={styles.simulatedMap}>
            {/* Grid lines */}
            <View style={[styles.gridLine, { top: '35%' }]} />
            <View style={[styles.gridLine, { top: '65%' }]} />
            <View style={[styles.gridLine, { left: '40%', width: 1, height: '100%' }]} />
            
            {/* Red Warning Pin */}
            <View style={[styles.warningPin, { top: '45%', left: '45%' }]}>
              <View style={styles.pinRipple} />
              <Feather name="map-pin" size={24} color="#EF4444" />
            </View>
          </View>
        </View>

        {/* Moderation section */}
        <View style={styles.moderationCard}>
          <Text style={styles.moderationTitle}>Verify this report</Text>
          <Text style={styles.moderationSubtitle}>
            Is this report accurate? Upvote if you can confirm, downvote if it is false/resolved.
          </Text>

          <View style={styles.voteRow}>
            <TouchableOpacity 
              style={[styles.voteBtn, myVote === 'up' && styles.activeUpvote]}
              onPress={() => handleVote('up')}
            >
              <Feather name="thumbs-up" size={18} color={myVote === 'up' ? '#16A34A' : '#4B5563'} />
              <Text style={[styles.voteBtnText, myVote === 'up' && { color: '#16A34A' }]}>Confirm Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.voteBtn, myVote === 'down' && styles.activeDownvote]}
              onPress={() => handleVote('down')}
            >
              <Feather name="thumbs-down" size={18} color={myVote === 'down' ? '#DC2626' : '#4B5563'} />
              <Text style={[styles.voteBtnText, myVote === 'down' && { color: '#DC2626' }]}>Invalid / False</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.totalVotesText}>{votes} community members verified this</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 20,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  timeTag: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  reporterName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  descriptionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '500',
  },
  aiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6D28D9',
    marginLeft: 8,
    flex: 1,
  },
  aiStatusBadge: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  aiStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6D28D9',
  },
  aiMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  aiMetricItem: {
    flex: 1,
  },
  aiMetricLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  aiMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  aiCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    padding: 8,
    borderRadius: 10,
  },
  aiCalloutText: {
    fontSize: 11,
    color: '#0E9F6E',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  mapCard: {
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  simulatedMap: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: '#D1D5DB',
  },
  warningPin: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinRipple: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  moderationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  moderationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  moderationSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    maxWidth: '90%',
  },
  voteRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  activeUpvote: {
    borderColor: '#10B981',
    backgroundColor: '#DEF7EC',
  },
  activeDownvote: {
    borderColor: '#EF4444',
    backgroundColor: '#FDE8E8',
  },
  voteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  totalVotesText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
