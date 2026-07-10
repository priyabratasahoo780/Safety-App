import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CircularSafetyScore } from './CircularSafetyScore';
import { SafetyCategoryItem } from './SafetyCategoryItem';
import { SafetyAnalysisData } from '../types/safety-analysis.types';

interface SafetyScoreCardProps {
  data: SafetyAnalysisData;
}

export const SafetyScoreCard: React.FC<SafetyScoreCardProps> = ({ data }) => {
  return (
    <View style={styles.card}>
      
      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Your Safety Score</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{data.status}</Text>
            </View>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{data.overallScore}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          
          <Text style={styles.description}>
            Keep it up! You're following good safety practices.
          </Text>
        </View>

        <View style={styles.chartCol}>
          <CircularSafetyScore percentage={data.overallScore} size={110} strokeWidth={10} />
        </View>
      </View>

      {/* Categories Row */}
      <View style={styles.categoriesSection}>
        {data.categories.map((cat, index) => (
          <React.Fragment key={cat.id}>
            <SafetyCategoryItem category={cat} />
            {index < data.categories.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FAFAFD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2ECFF',
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#7138E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#F9F7FF',
  },
  infoCol: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10153A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#12B76A',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#12B76A',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#7138E8',
    lineHeight: 56,
  },
  scoreMax: {
    fontSize: 16,
    color: '#596080',
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: '#596080',
    lineHeight: 18,
    fontWeight: '500',
  },
  chartCol: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#F2ECFF',
  }
});
