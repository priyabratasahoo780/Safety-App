import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function CompleteScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    // Navigate to the main app dashboard
    router.replace('/(drawer)/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.skipButton} onPress={handleGoHome}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('@/assets/images/safesphere_illustration.png')}
            style={styles.illustration}
            contentFit="contain"
          />
          <View style={styles.successBadge}>
            <Feather name="check" size={24} color="#FFFFFF" />
          </View>
        </View>

        {/* Header Texts */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{"You're All Set!"}</Text>
          <Text style={styles.subtitle}>
            Your SafeSphere AI account is ready.{'\n'}
            {"Stay alert, stay safe. We've got your back."}
          </Text>
        </View>

        {/* Safety Toolkit Section */}
        <View style={styles.toolkitCard}>
          <Text style={styles.toolkitTitle}>Your Safety Toolkit is Ready</Text>
          <View style={styles.toolkitIconsRow}>
            <View style={styles.toolkitItem}>
              <View style={styles.toolkitIconWrapper}>
                <Feather name="bell" size={20} color="#F34E62" />
              </View>
              <Text style={styles.toolkitItemText}>Instant{'\n'}SOS</Text>
            </View>
            <View style={styles.toolkitItem}>
              <View style={styles.toolkitIconWrapper}>
                <Feather name="map-pin" size={20} color="#F34E62" />
              </View>
              <Text style={styles.toolkitItemText}>Live{'\n'}Tracking</Text>
            </View>
            <View style={styles.toolkitItem}>
              <View style={styles.toolkitIconWrapper}>
                <Feather name="shield" size={20} color="#F34E62" />
              </View>
              <Text style={styles.toolkitItemText}>AI Safety{'\n'}Score</Text>
            </View>
            <View style={styles.toolkitItem}>
              <View style={styles.toolkitIconWrapper}>
                <Feather name="users" size={20} color="#F34E62" />
              </View>
              <Text style={styles.toolkitItemText}>Trusted{'\n'}Contacts</Text>
            </View>
            <View style={styles.toolkitItem}>
              <View style={styles.toolkitIconWrapper}>
                <MaterialCommunityIcons name="robot-outline" size={20} color="#F34E62" />
              </View>
              <Text style={styles.toolkitItemText}>AI{'\n'}Assistant</Text>
            </View>
          </View>
        </View>

        {/* Explore Key Features */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Explore Key Features</Text>

          {/* Feature 1 */}
          <TouchableOpacity style={styles.featureItem}>
            <View style={[styles.featureIconWrapper, { backgroundColor: '#FFF0F2' }]}>
              <Text style={{ color: '#F34E62', fontWeight: '800', fontSize: 12 }}>SOS</Text>
            </View>
            <View style={styles.featureTextContent}>
              <Text style={styles.featureItemTitle}>Emergency SOS</Text>
              <Text style={styles.featureItemDesc}>One tap to alert your trusted contacts</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#F34E62" />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Feature 2 */}
          <TouchableOpacity style={styles.featureItem}>
            <View style={[styles.featureIconWrapper, { backgroundColor: '#F5F3FF' }]}>
              <Feather name="map-pin" size={16} color="#9061F9" />
            </View>
            <View style={styles.featureTextContent}>
              <Text style={styles.featureItemTitle}>Live Tracking</Text>
              <Text style={styles.featureItemDesc}>Share live location and get live updates</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9061F9" />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Feature 3 */}
          <TouchableOpacity style={styles.featureItem}>
            <View style={[styles.featureIconWrapper, { backgroundColor: '#DEF7EC' }]}>
              <Feather name="shield" size={16} color="#10B981" />
            </View>
            <View style={styles.featureTextContent}>
              <Text style={styles.featureItemTitle}>AI Safety Score</Text>
              <Text style={styles.featureItemDesc}>Get AI-powered safety insights and risk alerts</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#10B981" />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Feature 4 */}
          <TouchableOpacity style={styles.featureItem}>
            <View style={[styles.featureIconWrapper, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="users" size={16} color="#F59E0B" />
            </View>
            <View style={styles.featureTextContent}>
              <Text style={styles.featureItemTitle}>Community Safety</Text>
              <Text style={styles.featureItemDesc}>Report incidents and help build a safer community</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#F59E0B" />
          </TouchableOpacity>
          <View style={styles.divider} />

          {/* Feature 5 */}
          <TouchableOpacity style={styles.featureItem}>
            <View style={[styles.featureIconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <MaterialCommunityIcons name="message-processing-outline" size={16} color="#3B82F6" />
            </View>
            <View style={styles.featureTextContent}>
              <Text style={styles.featureItemTitle}>AI Assistant</Text>
              <Text style={styles.featureItemDesc}>Get instant guidance, tips and support</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Go to Home Button */}
        <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
          <Text style={styles.homeButtonText}>Go to Home</Text>
          <Feather name="chevron-right" size={20} color="#FFFFFF" style={styles.buttonArrow} />
        </TouchableOpacity>

        {/* Take a quick tour */}
        <TouchableOpacity style={styles.tourButton}>
          <Text style={styles.tourButtonText}>Take a quick tour</Text>
          <Feather name="chevron-right" size={16} color="#F34E62" style={{ marginLeft: 4 }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipButton: {
    padding: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#F34E62',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 24,
  },
  illustration: {
    width: 140,
    height: 140,
  },
  successBadge: {
    position: 'absolute',
    bottom: 10,
    right: 80,
    backgroundColor: '#10B981',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  toolkitCard: {
    backgroundColor: '#FFF0F2',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  toolkitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F34E62',
    marginBottom: 16,
  },
  toolkitIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  toolkitItem: {
    alignItems: 'center',
    flex: 1,
  },
  toolkitIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#F34E62',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toolkitItemText: {
    fontSize: 11,
    color: '#111827',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTextContent: {
    flex: 1,
    paddingRight: 12,
  },
  featureItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  featureItemDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  homeButton: {
    backgroundColor: '#F34E62',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#F34E62',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonArrow: {
    marginLeft: 8,
  },
  tourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tourButtonText: {
    fontSize: 15,
    color: '#F34E62',
    fontWeight: '600',
  },
});

