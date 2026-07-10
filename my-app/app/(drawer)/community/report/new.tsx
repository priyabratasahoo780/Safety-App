import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const CATEGORIES = [
  { id: 'harassment', label: 'Harassment', color: '#EF4444' },
  { id: 'lighting', label: 'Poor Lighting', color: '#F59E0B' },
  { id: 'suspicious', label: 'Suspicious Activity', color: '#8B5CF6' },
  { id: 'blocked', label: 'Blocked Path', color: '#3B82F6' },
];

export default function ReportIncidentScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // In a real app, this would submit to the backend
    // For now, just navigate back to the community feed
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionTitle}>Incident Type</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color }
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryChipText,
                    isSelected && { color: '#FFFFFF' }
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.inputContainer}>
            <Feather name="map-pin" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E.g. Sector V Metro Station"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what happened or what you saw..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
            />
          </View>
          
          <View style={styles.anonymousWarning}>
            <Feather name="shield" size={16} color="#10B981" />
            <Text style={styles.anonymousText}>Your report will be completely anonymous and only shared with verified community members.</Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.submitBtn,
              (!selectedCategory || !location || !description) && styles.submitBtnDisabled
            ]}
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={!selectedCategory || !location || !description}
          >
            <Text style={styles.submitBtnText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    marginTop: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1F2937',
  },
  textAreaContainer: {
    height: 140,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  textArea: {
    flex: 1,
    width: '100%',
    fontSize: 15,
    color: '#1F2937',
  },
  anonymousWarning: {
    flexDirection: 'row',
    backgroundColor: '#DEF7EC',
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  anonymousText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  submitBtn: {
    backgroundColor: '#6D28D9',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
