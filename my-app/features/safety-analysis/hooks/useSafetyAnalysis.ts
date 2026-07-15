import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { collection, getDocs, query, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../../src/config/firebaseConfig';
import { getHistoricalBaseScore } from '../../../constants/historicalCrimeData';
import { SafetyAnalysisData } from '../types/safety-analysis.types';
import { calculateOverallScore, determineSafetyStatus } from '../services/safetyAnalysisService';

export const useSafetyAnalysis = () => {
  const { user } = useUser();
  const [data, setData] = useState<SafetyAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let travelSafetyScore = 80;
      let lifestyleSafetyScore = 50;
      let homeSafetyScore = 70;
      let digitalSafetyScore = 90; // Since they are logged in with Clerk securely
      
      const risks: any[] = [];
      const recommendations: any[] = [];

      // Create promises to run concurrently for massive speedup
      const promises: any[] = [];

      // 1. User Profile Promise
      let userProfilePromise: Promise<any> = Promise.resolve(null);
      if (user) {
        const userRef = doc(db, 'users', user.id);
        userProfilePromise = getDoc(userRef);
      }

      // 2. Community Reports Promise (Limit to 50 for speed instead of fetching all)
      const q = query(collection(db, 'community_reports'), orderBy('createdAt', 'desc'), limit(50));
      const reportsPromise = getDocs(q);

      // 3. Location Promise
      let locationPromise = (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Use last known position for instant load, fallback to balanced accuracy if null
          let loc = await Location.getLastKnownPositionAsync({});
          if (!loc) {
            loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          }
          if (loc) {
            const geocode = await Location.reverseGeocodeAsync({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude
            });
            return { loc, geocode };
          }
        }
        return null;
      })();

      // Wait for all promises concurrently
      const [userSnap, snapshot, locationData] = await Promise.all([
        userProfilePromise,
        reportsPromise,
        locationPromise
      ]);

      // --- Process Lifestyle Safety ---
      if (userSnap && userSnap.exists()) {
        const profile = userSnap.data();
        const contactsCount = profile.trustedContacts ? profile.trustedContacts.length : 0;
        if (contactsCount === 0) {
          lifestyleSafetyScore = 40;
          risks.push({
            id: 'r_lifestyle_1', title: 'No Guardians', description: 'You have no trusted contacts added.',
            risk: 'High Risk', percentage: 70, iconName: 'users-round', themeColor: '#FDEBF1', progressColor: '#F04470'
          });
          recommendations.push({
            id: 'rec_lifestyle_1', title: 'Add Trusted Contacts', description: 'Add friends or family for emergencies.',
            iconName: 'user-plus', themeColor: '#F04470', buttonText: 'Add Now', actionType: 'view_tips'
          });
        } else if (contactsCount <= 2) {
          lifestyleSafetyScore = 75;
          risks.push({
            id: 'r_lifestyle_2', title: 'Small Safety Network', description: 'Consider adding more trusted contacts.',
            risk: 'Low Risk', percentage: 30, iconName: 'users', themeColor: '#FFF4E5', progressColor: '#F59E0B'
          });
        } else {
          lifestyleSafetyScore = 95;
        }
      }

      // --- Process Travel Safety ---
      if (locationData) {
        const currentRegion = locationData.geocode && locationData.geocode.length > 0 ? (locationData.geocode[0].region || '') : '';
        const historicalBaseScore = getHistoricalBaseScore(currentRegion);
        
        let harassmentCount = 0;
        let theftCount = 0;
        let suspiciousCount = 0;
        let lightingCount = 0;

        snapshot.forEach((docSnap) => {
          const rData = docSnap.data();
          if (rData.category === 'Harassment') harassmentCount++;
          else if (rData.category === 'Theft' || rData.category === 'Assault') theftCount++;
          else if (rData.category === 'Suspicious Activity') suspiciousCount++;
          else if (rData.category === 'Poor Lighting') lightingCount++;
        });
        
        const liveIncidentImpact = (harassmentCount * 15) + (theftCount * 20) + (suspiciousCount * 10) + (lightingCount * 5);
        const totalRiskScore = Math.min(100, historicalBaseScore + liveIncidentImpact);
        travelSafetyScore = Math.max(0, 100 - totalRiskScore);

        if (travelSafetyScore < 50) {
          risks.push({
            id: 'r_travel_1', title: 'High Crime Area', description: 'Local incident reports are high.',
            risk: 'High Risk', percentage: 80, iconName: 'triangle-alert', themeColor: '#FDEBF1', progressColor: '#F04470'
          });
          recommendations.push({
            id: 'rec_travel_1', title: 'Share Live Location', description: 'Share your location when traveling here.',
            iconName: 'map-pin', themeColor: '#2E90FA', buttonText: 'Share Now', actionType: 'share_now'
          });
        } else if (travelSafetyScore >= 50 && travelSafetyScore < 80) {
            risks.push({
                id: 'r_travel_2', title: 'Moderate Risk Area', description: 'Stay aware of your surroundings.',
                risk: 'Medium Risk', percentage: 50, iconName: 'triangle-alert', themeColor: '#FFF4E5', progressColor: '#F79009'
            });
        }
      } else {
        travelSafetyScore = 60; // Fallback
        risks.push({
          id: 'r_travel_3', title: 'Location Disabled', description: 'Enable location for better safety analysis.',
          risk: 'Medium Risk', percentage: 50, iconName: 'map-pin-off', themeColor: '#FFF4E5', progressColor: '#F79009'
        });
      }

      // --- Process Home Safety ---
      const currentHour = new Date().getHours();
      if (currentHour >= 22 || currentHour < 5) {
        homeSafetyScore = 55;
        risks.push({
          id: 'r_home_1', title: 'Late Night Safety', description: 'It is late. Avoid staying out unnecessarily.',
          risk: 'Medium Risk', percentage: 60, iconName: 'moon-star', themeColor: '#F2ECFF', progressColor: '#7138E8'
        });
        recommendations.push({
          id: 'rec_home_1', title: 'Enable Safety Timer', description: 'Use timer if you are out late.',
          iconName: 'bell', themeColor: '#7138E8', buttonText: 'Start Timer', actionType: 'start_timer'
        });
      } else {
        homeSafetyScore = 85;
      }
      
      if (recommendations.length === 0) {
          recommendations.push({
            id: 'rec_def', title: 'Maintain Good Habits', description: 'Keep following safety guidelines.',
            iconName: 'shield-check', themeColor: '#12B76A', buttonText: 'View Tips', actionType: 'view_tips'
          });
      }

      const calculatedScore = calculateOverallScore(
        lifestyleSafetyScore,
        travelSafetyScore,
        homeSafetyScore,
        digitalSafetyScore
      );

      const dynamicData: SafetyAnalysisData = {
        overallScore: calculatedScore,
        status: determineSafetyStatus(calculatedScore),
        isDemoData: false,
        categories: [
          { id: 'c1', title: 'Lifestyle Safety', score: lifestyleSafetyScore, color: '#12B76A' },
          { id: 'c2', title: 'Travel Safety', score: travelSafetyScore, color: '#2E90FA' },
          { id: 'c3', title: 'Home Safety', score: homeSafetyScore, color: '#F79009' },
          { id: 'c4', title: 'Digital Safety', score: digitalSafetyScore, color: '#F04470' },
        ],
        risks,
        recommendations
      };
      
      setData(dynamicData);
    } catch (err) {
      console.error(err);
      setError('Failed to load safety analysis data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refetch: loadData
  };
};
