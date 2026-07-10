import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { TriangleAlert, Lightbulb, House, LockKeyhole, ChevronRight } from 'lucide-react-native';
import { RiskBreakdownItem as RiskBreakdownItemType } from '../types/safety-analysis.types';

interface RiskBreakdownItemProps {
  item: RiskBreakdownItemType;
}

export const RiskBreakdownItem: React.FC<RiskBreakdownItemProps> = ({ item }) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: item.percentage,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [item.percentage]);

  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'triangle-alert': return <TriangleAlert size={22} color={color} />;
      case 'lightbulb': return <Lightbulb size={22} color={color} />;
      case 'house': return <House size={22} color={color} />;
      case 'lock-keyhole': return <LockKeyhole size={22} color={color} />;
      default: return <TriangleAlert size={22} color={color} />;
    }
  };

  // Decide risk text color based on risk level
  const getRiskTextColor = () => {
    if (item.risk === 'High Risk') return '#EF4444';
    if (item.risk === 'Medium Risk') return '#F79009';
    return '#12B76A';
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerRow}>
        <View style={[styles.iconBg, { backgroundColor: item.themeColor }]}>
          {getIcon(item.iconName, item.progressColor === '#F79009' ? '#7138E8' : item.progressColor)}
        </View>
        
        <View style={styles.textCol}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        
        <View style={styles.riskBadge}>
          <Text style={[styles.riskText, { color: getRiskTextColor() }]}>{item.risk}</Text>
          <ChevronRight size={16} color="#9CA3AF" />
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.track}>
          <Animated.View 
            style={[
              styles.fill, 
              { 
                backgroundColor: item.progressColor,
                width: animatedWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </View>
        <Text style={styles.percentageText}>{item.percentage}%</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10153A',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#596080',
    fontWeight: '500',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 60, // Align with text
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECECF2',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#596080',
    width: 32,
    textAlign: 'right',
  }
});
