import { authService } from '../src/services/authService';
import { calculateOverallScore, determineSafetyStatus } from '../features/safety-analysis/services/safetyAnalysisService';

// Mock Firebase and other Expo modules so pure logic can be tested
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));
jest.mock('../src/config/firebaseConfig', () => ({ db: {} }));
jest.mock('expo-notifications', () => ({}));
jest.mock('expo-device', () => ({}));
jest.mock('expo-constants', () => ({}));
jest.mock('@clerk/clerk-expo', () => ({}));

describe('Pure Logic Tests (Phase 25)', () => {
  describe('authService', () => {
    it('generates a valid SafeSphere ID', () => {
      const id = authService.generateSafeSphereId();
      // Should match SSF-XXXX-XXXX
      expect(id).toMatch(/^SSF-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
      expect(id.length).toBe(13);
    });
  });

  describe('safetyAnalysisService', () => {
    it('calculates the overall score correctly', () => {
      // weights: 0.25, 0.30, 0.20, 0.25
      // 0.25*80 + 0.30*90 + 0.20*70 + 0.25*100 = 20 + 27 + 14 + 25 = 86
      const score = calculateOverallScore(80, 90, 70, 100);
      expect(score).toBe(86);
    });

    it('determines the safety status correctly', () => {
      expect(determineSafetyStatus(95)).toBe('Excellent');
      expect(determineSafetyStatus(85)).toBe('Good');
      expect(determineSafetyStatus(65)).toBe('Needs Improvement');
      expect(determineSafetyStatus(20)).toBe('High Risk');
    });
  });
});
