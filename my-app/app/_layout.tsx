import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/config/firebaseConfig";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Auth guard: Firebase auth state ke hisaab se redirect karta hai
function InitialLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user === undefined) return; // Still loading

    const inAuthGroup = segments[0] === "(auth)";
    const inDrawerGroup = segments[0] === "(drawer)";

    if (user && inAuthGroup) {
      // User signed in hai lekin auth pages par hai — home bhejo
      router.replace("/(drawer)/(tabs)/home");
    } else if (!user && inDrawerGroup) {
      // User signed out hai lekin protected pages par hai — sign-in bhejo
      router.replace("/(auth)/sign-in");
    }
  }, [user, segments]);

  if (user === undefined) {
    // Auth state load ho raha hai — blank screen dikhao (no flash)
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="oauth-native-callback" options={{ headerShown: false }} />
      <Stack.Screen
        name="test-ai-voice"
        options={{ headerShown: false, presentation: "modal" }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
