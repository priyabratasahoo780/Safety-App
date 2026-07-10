import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';

interface ImproveScoreCardProps {
  onPress: () => void;
}

export const ImproveScoreCard: React.FC<ImproveScoreCardProps> = ({ onPress }) => {
  return (
    <View style={styles.card}>
      
      <View style={styles.iconBg}>
        <Star size={24} color="#F79009" fill="#F79009" />
      </View>
      
      <View style={styles.textCol}>
        <Text style={styles.title}>Want a better score?</Text>
        <Text style={styles.description}>Follow our tips and stay consistent.</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Improve My Score</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E8',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#FDE4B4',
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#F79009',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10153A',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#F79009',
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F79009',
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F79009',
  }
});
