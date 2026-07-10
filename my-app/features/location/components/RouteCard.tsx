import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { RouteOption } from '../types/location.types';
import { Shield, AlertTriangle, ShieldAlert, ChevronRight } from 'lucide-react-native';

interface Props {
  route: RouteOption;
  isSelected: boolean;
  onSelect: (route: RouteOption) => void;
}

export const RouteCard: React.FC<Props> = ({ route, isSelected, onSelect }) => {
  const getIcon = () => {
    switch (route.theme) {
      case 'green': return <Shield size={24} color="#12B76A" />;
      case 'orange': return <AlertTriangle size={24} color="#F79009" />;
      case 'red': return <ShieldAlert size={24} color="#F04438" />;
    }
  };

  const getThemeStyles = () => {
    switch (route.theme) {
      case 'green': return { borderColor: '#12B76A', bgColor: '#E8F8F0', textColor: '#12B76A' };
      case 'orange': return { borderColor: '#F79009', bgColor: '#FFF4E5', textColor: '#F79009' };
      case 'red': return { borderColor: '#F04438', bgColor: '#FDECEC', textColor: '#F04438' };
    }
  };

  const themeStyle = getThemeStyles();

  return (
    <Pressable 
      onPress={() => onSelect(route)}
      style={[
        styles.card,
        isSelected && { borderColor: themeStyle.borderColor, borderWidth: 1.5 }
      ]}
    >
      <View style={styles.contentRow}>
        <View style={[styles.iconContainer, { backgroundColor: themeStyle.bgColor }]}>
          {getIcon()}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: themeStyle.textColor }]}>{route.title}</Text>
          <Text style={styles.description} numberOfLines={1}>{route.description} (Demo)</Text>
          
          <View style={styles.tagsContainer}>
            {route.tags.map((tag, idx) => (
              <View key={idx} style={[styles.tag, { backgroundColor: themeStyle.bgColor }]}>
                <Text style={[styles.tagText, { color: themeStyle.textColor }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={[styles.duration, { color: themeStyle.textColor }]}>{route.duration}</Text>
          <Text style={styles.distance}>{route.distance}</Text>
        </View>
        <ChevronRight size={20} color="#596080" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#596080',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statsContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  duration: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  distance: {
    fontSize: 13,
    color: '#596080',
  }
});
