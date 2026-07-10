import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ShieldCheck, MapPin, Phone, MoreHorizontal } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Props {
  onSelectPrompt: (prompt: string) => void;
  onOpenMore: () => void;
}

export function QuickActionChips({ onSelectPrompt, onOpenMore }: Props) {
  const router = useRouter();

  const handleNearbySafePlaces = () => {
    // Instead of navigating to a missing /location route which crashes the app,
    // we directly send the prompt.
    onSelectPrompt('How can I identify a safer nearby public place?');
  };

  const handleFakeCall = () => {
    // Instead of navigating to a missing /fake-call route,
    // we show an alert.
    alert('Fake Call feature will be available soon.');
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity 
          style={[styles.chip, styles.purpleChip]}
          onPress={() => onSelectPrompt('Give me five practical personal-safety tips.')}
          accessibilityRole="button"
          accessibilityLabel="Safety Tips"
        >
          <ShieldCheck size={16} color="#6D35E8" />
          <Text style={[styles.chipText, { color: '#6D35E8' }]}>Safety Tips</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chip, styles.greenChip]}
          onPress={handleNearbySafePlaces}
          accessibilityRole="button"
          accessibilityLabel="Nearby Safe Places"
        >
          <MapPin size={16} color="#12B76A" />
          <Text style={[styles.chipText, { color: '#12B76A' }]}>Nearby Safe Places</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chip, styles.orangeChip]}
          onPress={handleFakeCall}
          accessibilityRole="button"
          accessibilityLabel="Fake Call"
        >
          <Phone size={16} color="#F59E0B" />
          <Text style={[styles.chipText, { color: '#F59E0B' }]}>Fake Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.chip, styles.grayChip]}
          onPress={onOpenMore}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <MoreHorizontal size={16} color="#596080" />
          <Text style={[styles.chipText, { color: '#596080' }]}>More</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  purpleChip: {
    backgroundColor: '#F2ECFF',
    borderColor: '#E7E3F2',
  },
  greenChip: {
    backgroundColor: '#ECFDF3',
    borderColor: '#D1FADF',
  },
  orangeChip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  grayChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
});
