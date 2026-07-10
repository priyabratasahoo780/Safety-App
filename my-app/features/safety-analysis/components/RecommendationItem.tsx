import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MoonStar, Users, Bell, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafetyRecommendation } from '../types/safety-analysis.types';

interface RecommendationItemProps {
  item: SafetyRecommendation;
  onOpenTips: () => void;
}

export const RecommendationItem: React.FC<RecommendationItemProps> = ({ item, onOpenTips }) => {
  const router = useRouter();

  const handleAction = () => {
    switch (item.actionType) {
      case 'view_tips':
        onOpenTips();
        break;
      case 'plan_route':
        // Navigate to existing route page
        router.push('/(drawer)/(tabs)/navigate');
        break;
      case 'start_timer':
        Alert.alert('Info', 'Safety Timer will be available soon.');
        break;
      case 'share_now':
        // Navigate to existing live tracking
        router.push('/(drawer)/(tabs)/live-tracking');
        break;
    }
  };

  const getIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'moon-star': return <MoonStar size={20} color={color} />;
      case 'users': return <Users size={20} color={color} />;
      case 'bell': return <Bell size={20} color={color} />;
      case 'map-pin': return <MapPin size={20} color={color} />;
      default: return <MoonStar size={20} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconBg, { backgroundColor: `${item.themeColor}15` }]}>
        {getIcon(item.iconName, item.themeColor)}
      </View>
      
      <View style={styles.textCol}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.actionBtn, { borderColor: `${item.themeColor}40` }]} 
        onPress={handleAction}
      >
        <Text style={[styles.actionText, { color: item.themeColor }]}>{item.buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
    paddingRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10153A',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#596080',
    lineHeight: 16,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  }
});
