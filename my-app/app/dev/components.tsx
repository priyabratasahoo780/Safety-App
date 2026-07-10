import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DevComponentsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Design System Showcase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          SafeSphere AI Design System Primitives & Tokens (Clean Architecture Preview)
        </Text>

        {/* 1. Color Palette Tokens */}
        <Text style={styles.sectionTitle}>1. Color Palette Tokens</Text>
        <View style={styles.card}>
          <View style={styles.colorRow}>
            <View style={styles.colorItem}>
              <View style={[styles.colorBlock, { backgroundColor: '#6D28D9' }]} />
              <Text style={styles.colorLabel}>Primary (Violet)</Text>
              <Text style={styles.colorHex}>#6D28D9</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBlock, { backgroundColor: '#16A34A' }]} />
              <Text style={styles.colorLabel}>Safe Green</Text>
              <Text style={styles.colorHex}>#16A34A</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBlock, { backgroundColor: '#D97706' }]} />
              <Text style={styles.colorLabel}>Caution Orange</Text>
              <Text style={styles.colorHex}>#D97706</Text>
            </View>
            <View style={styles.colorItem}>
              <View style={[styles.colorBlock, { backgroundColor: '#DC2626' }]} />
              <Text style={styles.colorLabel}>Danger Red</Text>
              <Text style={styles.colorHex}>#DC2626</Text>
            </View>
          </View>
        </View>

        {/* 2. Safety Badges */}
        <Text style={styles.sectionTitle}>2. Safety Score Badges</Text>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            {/* Safe badge */}
            <View style={styles.badgeShowcase}>
              <View style={[styles.scoreBadge, { backgroundColor: '#16A34A' }]}>
                <Text style={styles.scoreText}>92</Text>
              </View>
              <Text style={styles.badgeLabel}>Low Risk (Safe)</Text>
            </View>

            {/* Caution badge */}
            <View style={styles.badgeShowcase}>
              <View style={[styles.scoreBadge, { backgroundColor: '#D97706' }]}>
                <Text style={styles.scoreText}>64</Text>
              </View>
              <Text style={styles.badgeLabel}>Moderate Caution</Text>
            </View>

            {/* Danger badge */}
            <View style={styles.badgeShowcase}>
              <View style={[styles.scoreBadge, { backgroundColor: '#DC2626' }]}>
                <Text style={styles.scoreText}>31</Text>
              </View>
              <Text style={styles.badgeLabel}>High Danger Zone</Text>
            </View>
          </View>
        </View>

        {/* 3. Action Buttons */}
        <Text style={styles.sectionTitle}>3. Button Primitives</Text>
        <View style={styles.card}>
          <View style={styles.buttonStack}>
            {/* Primary violet */}
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Primary Button</Text>
            </TouchableOpacity>

            {/* Secondary outline */}
            <TouchableOpacity style={styles.outlineBtn}>
              <Text style={styles.outlineBtnText}>Outline Button</Text>
            </TouchableOpacity>

            {/* Giant Circular Emergency button */}
            <View style={styles.emergencyBtnContainer}>
              <TouchableOpacity style={styles.emergencyBtn}>
                <MaterialCommunityIcons name="alert" size={32} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.emergencyBtnLabel}>Elevated SOS Button</Text>
            </View>
          </View>
        </View>

        {/* 4. Alert & Info Callouts */}
        <Text style={styles.sectionTitle}>4. Warning & Info Callouts</Text>
        <View style={styles.card}>
          <View style={styles.calloutStack}>
            {/* Safe zone overlay */}
            <View style={styles.safeCallout}>
              <Feather name="check-circle" size={16} color="#059669" />
              <Text style={styles.safeCalloutText}>Verified safe haven nearby</Text>
            </View>

            {/* Danger overlay */}
            <View style={styles.dangerCallout}>
              <MaterialCommunityIcons name="alert-octagon" size={18} color="#B91C1C" />
              <Text style={styles.dangerCalloutText}>TRAVELER IN EMERGENCY MODE</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  introText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: 25,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorItem: {
    alignItems: 'center',
    width: '23%',
  },
  colorBlock: {
    width: '100%',
    height: 50,
    borderRadius: 10,
  },
  colorLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 6,
  },
  colorHex: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeShowcase: {
    alignItems: 'center',
  },
  scoreBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 6,
  },
  buttonStack: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#6D28D9',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  outlineBtn: {
    borderColor: '#EDE9FE',
    borderWidth: 1.5,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: {
    color: '#6D28D9',
    fontWeight: '700',
    fontSize: 14,
  },
  emergencyBtnContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  emergencyBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  emergencyBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 8,
  },
  calloutStack: {
    gap: 10,
  },
  safeCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  safeCalloutText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  dangerCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  dangerCalloutText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 1,
  },
});

