import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Incident {
  id: string;
  category: 'Harassment' | 'Poor Lighting' | 'Suspicious Activity' | 'Blocked Path';
  location: string;
  time: string;
  description: string;
  votes: number;
  myVote: 'up' | 'down' | null;
  verified: boolean;
}

export default function CommunityScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'feed' | 'heatmap'>('heatmap');
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      category: 'Poor Lighting',
      location: 'Near Salt Lake Sector V Metro Station',
      time: '2 hours ago',
      description: 'Streetlights under the metro bridge are completely broken. Extremely dark walking path after 8 PM.',
      votes: 18,
      myVote: null,
      verified: true,
    },
    {
      id: '2',
      category: 'Harassment',
      location: 'Block GP, Sector V',
      time: '1 day ago',
      description: 'Group of men loitering near the tea stall catcalling women walking past towards office complexes.',
      votes: 34,
      myVote: null,
      verified: true,
    },
    {
      id: '3',
      category: 'Suspicious Activity',
      location: 'Sector 3 Park Lane',
      time: '3 days ago',
      description: 'Unmarked van parked near the playground gates for multiple nights. Drivers watching passersby.',
      votes: 8,
      myVote: null,
      verified: false,
    }
  ]);

  const handleVote = (id: string, type: 'up' | 'down') => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== id) return inc;
      
      let voteChange = 0;
      let newVote: 'up' | 'down' | null = type;

      if (inc.myVote === type) {
        // Undo vote
        voteChange = type === 'up' ? -1 : 1;
        newVote = null;
      } else {
        // Change vote or new vote
        const prevChange = inc.myVote === 'up' ? -1 : inc.myVote === 'down' ? 1 : 0;
        const newChange = type === 'up' ? 1 : -1;
        voteChange = prevChange + newChange;
      }

      return {
        ...inc,
        votes: inc.votes + voteChange,
        myVote: newVote,
      };
    }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Harassment': return '#EF4444';
      case 'Poor Lighting': return '#F59E0B';
      case 'Suspicious Activity': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community Safety</Text>
        <Text style={styles.subtitle}>Help your community by reporting incidents</Text>
        
        {/* Toggle tab */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'feed' && styles.activeToggleBtn]}
            onPress={() => setActiveTab('feed')}
          >
            <Feather name="list" size={16} color={activeTab === 'feed' ? '#6D28D9' : '#6B7280'} />
            <Text style={[styles.toggleText, activeTab === 'feed' && styles.activeToggleText]}>
              Incident Feed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.toggleBtn, activeTab === 'heatmap' && styles.activeToggleBtn]}
            onPress={() => setActiveTab('heatmap')}
          >
            <Feather name="map" size={16} color={activeTab === 'heatmap' ? '#6D28D9' : '#6B7280'} />
            <Text style={[styles.toggleText, activeTab === 'heatmap' && styles.activeToggleText]}>
              Safety Heatmap
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'feed' ? (
        /* Incident Feed list */
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {incidents.map((incident) => (
            <TouchableOpacity 
              key={incident.id} 
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/community/report/${incident.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(incident.category) + '15' }]}>
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(incident.category) }]} />
                  <Text style={[styles.categoryText, { color: getCategoryColor(incident.category) }]}>
                    {incident.category}
                  </Text>
                </View>
                
                {incident.verified && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check" size={10} color="#16A34A" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              <Text style={styles.cardTitle}>{incident.location}</Text>
              <Text style={styles.cardTime}>{incident.time}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>{incident.description}</Text>

              {/* Moderation Controls (Voting) */}
              <View style={styles.cardFooter}>
                <View style={styles.voteControls}>
                  <TouchableOpacity 
                    style={[styles.voteBtn, incident.myVote === 'up' && styles.activeUpvote]}
                    onPress={() => handleVote(incident.id, 'up')}
                  >
                    <Feather 
                      name="thumbs-up" 
                      size={14} 
                      color={incident.myVote === 'up' ? '#16A34A' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                  
                  <Text style={[
                    styles.voteCount,
                    incident.myVote === 'up' && { color: '#16A34A', fontWeight: '700' },
                    incident.myVote === 'down' && { color: '#DC2626', fontWeight: '700' }
                  ]}>
                    {incident.votes} votes
                  </Text>

                  <TouchableOpacity 
                    style={[styles.voteBtn, incident.myVote === 'down' && styles.activeDownvote]}
                    onPress={() => handleVote(incident.id, 'down')}
                  >
                    <Feather 
                      name="thumbs-down" 
                      size={14} 
                      color={incident.myVote === 'down' ? '#DC2626' : '#6B7280'} 
                    />
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.shareBtn}>
                  <Feather name="share-2" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        /* Heatmap Map View */
        <View style={styles.heatmapWrapper}>
          <View style={styles.simulatedHeatmap}>
            {/* Grid lines */}
            <View style={[styles.mapGridLine, { top: '33%' }]} />
            <View style={[styles.mapGridLine, { top: '66%' }]} />
            <View style={[styles.mapGridLine, { left: '33%', width: 1, height: '100%', backgroundColor: '#E5E7EB' }]} />
            <View style={[styles.mapGridLine, { left: '66%', width: 1, height: '100%', backgroundColor: '#E5E7EB' }]} />

            {/* Simulated Heatmap Glow circles matching the mockup exactly */}
            <View style={[styles.glowCircle, styles.redGlow, { top: '45%', left: '20%' }]}>
              <View style={[styles.glowCore, { backgroundColor: '#EF4444' }]} />
            </View>
            <View style={[styles.glowCircle, styles.orangeGlow, { top: '25%', left: '55%' }]}>
              <View style={[styles.glowCore, { backgroundColor: '#F59E0B' }]} />
            </View>
            
            <View style={[styles.glowCircle, styles.redGlow, { top: '60%', left: '65%' }]}>
              <View style={[styles.glowCore, { backgroundColor: '#EF4444' }]} />
            </View>

            {/* Legend Overlay */}
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Heatmap Legend</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>High Risk (Harassment Hotspot)</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Moderate Risk (Dim Lighting)</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Floating Action Button to report incident */}
      <TouchableOpacity 
        style={styles.fabReport}
        activeOpacity={0.9}
        onPress={() => router.push('/community/report/new')}
      >
        <Feather name="edit-2" size={18} color="#FFFFFF" />
        <Text style={styles.fabText}>Report Incident</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginTop: 15,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeToggleBtn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#6D28D9',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DEF7EC',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  cardTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginTop: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  voteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 2,
  },
  voteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  activeUpvote: {
    backgroundColor: '#DEF7EC',
  },
  activeDownvote: {
    backgroundColor: '#FDE8E8',
  },
  voteCount: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginHorizontal: 10,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapWrapper: {
    flex: 1,
  },
  simulatedHeatmap: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapGridLine: {
    position: 'absolute',
    height: 1,
    width: '100%',
    backgroundColor: '#D1D5DB',
  },
  glowCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  redGlow: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  orangeGlow: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  glowCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    width: width * 0.7,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  fabReport: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D28D9',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 8,
  },
});

