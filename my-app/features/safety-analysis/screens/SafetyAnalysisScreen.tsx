import React, { useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  Pressable
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Info, X } from 'lucide-react-native';
import { useSafetyAnalysis } from '../hooks/useSafetyAnalysis';

import { SafetyScoreCard } from '../components/SafetyScoreCard';
import { RiskBreakdownCard } from '../components/RiskBreakdownCard';
import { RecommendationsCard } from '../components/RecommendationsCard';
import { ImproveScoreCard } from '../components/ImproveScoreCard';

export const SafetyAnalysisScreen = () => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useSafetyAnalysis();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [allRecommendationsModalVisible, setAllRecommendationsModalVisible] = useState(false);

  const scrollToRecommendations = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7138E8" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to load safety analysis</Text>
        <Text style={styles.errorText}>Please try again.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#10153A" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>AI Safety Analysis</Text>
          <Text style={styles.headerSubtitle}>Your personalized safety overview</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setInfoModalVisible(true)}>
          <Info size={24} color="#10153A" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SafetyScoreCard data={data} />
        
        <RiskBreakdownCard 
          risks={data.risks} 
          onViewDetails={() => setDetailsModalVisible(true)}
        />
        
        <RecommendationsCard 
          recommendations={data.recommendations} 
          onOpenTips={() => setTipsModalVisible(true)} 
          onSeeAll={() => setAllRecommendationsModalVisible(true)}
        />
        
        <ImproveScoreCard onPress={scrollToRecommendations} />

        {data.isDemoData && (
          <Text style={styles.demoLabel}>
            Demo safety insights — this score provides general guidance and does not guarantee personal safety.
          </Text>
        )}

        {/* Space for bottom tabs */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Info Modal */}
      <Modal visible={infoModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About Your Safety Score</Text>
            <Text style={styles.modalText}>
              Your safety score is an estimated overview based on your safety preferences and available activity data. It is designed to provide general guidance and does not guarantee personal safety.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Tips Modal */}
      <Modal visible={tipsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Late-Night Safety Tips</Text>
              <Pressable onPress={() => setTipsModalVisible(false)}>
                <X size={24} color="#10153A" />
              </Pressable>
            </View>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Prefer well-lit and populated routes.</Text>
              <Text style={styles.tipItem}>• Share your trip details with a trusted contact.</Text>
              <Text style={styles.tipItem}>• Keep your phone charged.</Text>
              <Text style={styles.tipItem}>• Stay aware of your surroundings.</Text>
              <Text style={styles.tipItem}>• Use the Safe Route feature when available.</Text>
            </View>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setTipsModalVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal visible={detailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Detailed Insights</Text>
              <Pressable onPress={() => setDetailsModalVisible(false)}>
                <X size={24} color="#10153A" />
              </Pressable>
            </View>
            <Text style={styles.modalText}>
              Your risk breakdown is calculated by analyzing your daily routines, visited locations, and digital habits. We compare these patterns against local safety indexes to provide these detailed metrics.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* All Recommendations Modal */}
      <Modal visible={allRecommendationsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>All Recommendations</Text>
              <Pressable onPress={() => setAllRecommendationsModalVisible(false)}>
                <X size={24} color="#10153A" />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300, marginBottom: 20 }} showsVerticalScrollIndicator={false}>
              {data.recommendations.map(rec => (
                <View key={rec.id} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: rec.themeColor, marginBottom: 4 }}>
                    {rec.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#596080', lineHeight: 18 }}>
                    {rec.description}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setAllRecommendationsModalVisible(false)}>
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFD', // Neumorphic sleek off-white
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10153A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#596080',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  demoLabel: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginHorizontal: 30,
    marginTop: -20,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10153A',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#596080',
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7138E8',
    borderRadius: 12,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 21, 58, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10153A',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#596080',
    lineHeight: 22,
    marginBottom: 24,
  },
  tipsList: {
    marginBottom: 24,
    gap: 12,
  },
  tipItem: {
    fontSize: 14,
    color: '#596080',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#7138E8',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
