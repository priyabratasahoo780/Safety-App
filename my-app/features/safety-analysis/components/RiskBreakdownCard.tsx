import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { RiskBreakdownItem } from './RiskBreakdownItem';
import { RiskBreakdownItem as RiskBreakdownItemType } from '../types/safety-analysis.types';

interface RiskBreakdownCardProps {
  risks: RiskBreakdownItemType[];
  onViewDetails: () => void;
}

export const RiskBreakdownCard: React.FC<RiskBreakdownCardProps> = ({ risks, onViewDetails }) => {

  return (
    <View style={styles.wrapper}>
      
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Risk Breakdown</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={onViewDetails}>
          <Text style={styles.actionText}>View Details</Text>
          <ChevronRight size={16} color="#7138E8" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        {risks.map((risk, index) => (
          <React.Fragment key={risk.id}>
            <RiskBreakdownItem item={risk} />
            {index < risks.length - 1 && <View style={styles.separator} />}
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
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
    marginLeft: 80, // Align with content, not icon
    marginRight: 20,
  }
});
