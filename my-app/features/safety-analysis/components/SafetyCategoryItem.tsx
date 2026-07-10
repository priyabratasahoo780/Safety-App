import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, MapPinned, House, LockKeyhole } from 'lucide-react-native';
import { SafetyCategoryScore } from '../types/safety-analysis.types';

interface SafetyCategoryItemProps {
  category: SafetyCategoryScore;
}

export const SafetyCategoryItem: React.FC<SafetyCategoryItemProps> = ({ category }) => {
  
  const getIcon = (title: string, color: string) => {
    if (title.includes('Lifestyle')) return <ShieldCheck size={20} color={color} />;
    if (title.includes('Travel')) return <MapPinned size={20} color={color} />;
    if (title.includes('Home')) return <House size={20} color={color} />;
    return <LockKeyhole size={20} color={color} />;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${category.color}15` }]}>
        {getIcon(category.title, category.color)}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.scoreText}>{category.score}%</Text>
        <Text style={styles.titleText}>{category.title.replace(' Safety', '')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10153A',
  },
  titleText: {
    fontSize: 10,
    color: '#596080',
    fontWeight: '500',
  }
});
