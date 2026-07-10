import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { MapPin, ArrowUpDown } from 'lucide-react-native';

interface Props {
  currentAddress: string | null;
  destinationAddress: string | null;
  isDetecting: boolean;
}

export const LocationInputCard: React.FC<Props> = ({ currentAddress, destinationAddress, isDetecting }) => {
  const [destText, setDestText] = useState(destinationAddress || '');

  React.useEffect(() => {
    if (destinationAddress) {
      setDestText(destinationAddress);
    }
  }, [destinationAddress]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconColumn}>
          <View style={styles.dotIcon}>
            <View style={styles.innerDot} />
          </View>
          <View style={styles.dottedLine} />
          <MapPin size={20} color="#F04438" />
        </View>
        
        <View style={styles.inputColumn}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Your Location</Text>
            <Text style={styles.valueText} numberOfLines={1}>
              {isDetecting ? 'Detecting your location...' : (currentAddress || 'Location unknown')}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.inputSection}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your destination"
              placeholderTextColor="#A0A5B1"
              value={destText}
              onChangeText={setDestText}
            />
          </View>
        </View>
        
        <View style={styles.swapColumn}>
          <Pressable style={styles.swapButton}>
            <ArrowUpDown size={18} color="#596080" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  row: {
    flexDirection: 'row',
  },
  iconColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dotIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6D35E8',
  },
  dottedLine: {
    width: 1,
    flex: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    marginVertical: 4,
  },
  inputColumn: {
    flex: 1,
  },
  inputSection: {
    justifyContent: 'center',
    minHeight: 48,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10153A',
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: '#596080',
  },
  textInput: {
    fontSize: 14,
    color: '#10153A',
    padding: 0,
    margin: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 8,
  },
  swapColumn: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  }
});
