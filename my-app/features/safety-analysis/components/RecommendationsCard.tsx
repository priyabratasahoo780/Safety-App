import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RecommendationItem } from './RecommendationItem';
import { SafetyRecommendation } from '../types/safety-analysis.types';

interface RecommendationsCardProps {
  recommendations: SafetyRecommendation[];
  onOpenTips: () => void;
  onSeeAll: () => void;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations, onOpenTips, onSeeAll }) => {

  return (
    <View style={styles.wrapper}>
      
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Personalized Recommendations</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.actionText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {recommendations.map((rec, index) => (
          <React.Fragment key={rec.id}>
            <RecommendationItem item={rec} onOpenTips={onOpenTips} />
            {index < recommendations.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#10153A',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7138E8',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E9E5F2',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  }
});
