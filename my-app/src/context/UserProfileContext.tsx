import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { authService } from '../services/authService';

export interface UserProfile {
  fullName?: string;
  phone?: string;
  email?: string;
  safeSphereId?: string;
  trustedContacts?: any[];
  safetyPreferences?: any;
  [key: string]: any;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: null,
  isLoading: true,
  updateProfile: async () => {},
  refreshProfile: async () => {},
});

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const profile = await authService.getUserProfile(user.id);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (e) {
      console.warn('UserProfileContext: Failed to refresh profile', e);
    }
  }, [user?.id]);

  // Load profile when user logs in
  useEffect(() => {
    if (user?.id) {
      setIsLoading(true);
      refreshProfile().finally(() => setIsLoading(false));
    } else {
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) return;
    try {
      await authService.updateUserProfile(user.id, updates);
      // Optimistically update local state immediately
      setUserProfile(prev => prev ? { ...prev, ...updates } : { ...updates });
    } catch (e) {
      console.error('UserProfileContext: Failed to update profile', e);
      throw e;
    }
  }, [user?.id]);

  return (
    <UserProfileContext.Provider value={{ userProfile, isLoading, updateProfile, refreshProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};
