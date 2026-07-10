import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type Category = 'Harassment' | 'Poor Lighting' | 'Suspicious Activity' | 'Blocked Path';

export default function NewReportScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>('Harassment');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoAttach = () => {
    // Mock attaching photo
    setPhotos(prev => [...prev, `photo_${Date.now()}`]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!location || !description) {
      Alert.alert('Error', 'Please fill in the location and description fields.');
      return;
    }
    
    // Simulate successful incident filing
    Alert.alert('Report Filed', 'Your incident report has been submitted for moderation.', [
      { text: 'OK', onPress: () => router.replace('/(drawer)/(tabs)/community') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category selector */}
        <Text style={styles.sectionLabel}>Select Incident Category</Text>
        <View style={styles.chipsContainer}>
          {(['Harassment', 'Poor Lighting', 'Suspicious Activity', 'Blocked Path'] as Category[]).map(cat => {
            const active = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Location input */}
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Incident Location</Text>
          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={18} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Near Salt Lake Central Park gates"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* Description textbox */}
        <View style={styles.inputGroup}>
          <Text style={styles.sectionLabel}>Description & Details</Text>
          <View style={[styles.inputWrapper, styles.multilineWrapper]}>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="Please provide details (e.g. description of suspects, vehicle license numbers, exact duration, lighting condition)..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>

        {/* Photo Attachment row */}
        <Text style={styles.sectionLabel}>Attach Photos (Optional)</Text>
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePhotoAttach}>
            <Feather name="camera" size={24} color="#9CA3AF" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>

          {photos.map((photo, i) => (
            <View key={photo} style={styles.photoItem}>
              <View style={styles.mockPhotoSquare}>
                <Feather name="image" size={20} color="#6D28D9" />
                <Text style={styles.mockPhotoLabel}>Attachment {i + 1}</Text>
              </View>
              <TouchableOpacity style={styles.deletePhotoBtn} onPress={() => handleRemovePhoto(i)}>
                <Feather name="x" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Warning Callout */}
        <View style={styles.infoCard}>
          <Feather name="shield" size={16} color="#4B5563" style={{ marginRight: 8 }} />
          <Text style={styles.infoText}>
            Reports are classified by AI and verified by community votes. False reporting is subject to verification.
          </Text>
        </View>

        {/* Submit button */}
        <TouchableOpacity 
          style={styles.submitBtn}
          activeOpacity={0.9}
          onPress={handleSubmit}
        >
          <Feather name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Submit Safety Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeChip: {
    borderColor: '#6D28D9',
    backgroundColor: '#F9F7FD',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeChipText: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
  },
  multilineWrapper: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: '100%',
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addPhotoText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  photoItem: {
    position: 'relative',
  },
  mockPhotoSquare: {
    width: 90,
    height: 90,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    borderColor: '#EDE9FE',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mockPhotoLabel: {
    fontSize: 9,
    color: '#6D28D9',
    fontWeight: '700',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 25,
  },
  infoText: {
    fontSize: 11,
    color: '#4B5563',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    backgroundColor: '#6D28D9',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});

