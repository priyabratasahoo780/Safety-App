import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@/src/clerk";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { useEffect } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// Auth guard: sirf drawer ko protect karta hai
// Index/landing screen par auto-redirect NAHI hoga
function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inDrawerGroup = segments[0] === "(drawer)";
    const inAuthGroup = segments[0] === "(auth)";
    const isIndex = segments.length === 0 || (segments.length === 1 && segments[0] === "index");

    if (isSignedIn && (inAuthGroup || isIndex)) {
      // User signed in hai aur auth/landing pages par hai — home bhejo
      router.replace("/(drawer)/(tabs)/home");
    } else if (!isSignedIn && inDrawerGroup) {
      // User signed out hai aur protected drawer pages par hai — sign-in bhejo
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn, segments]);

  if (!isLoaded) {
    // Clerk load ho raha hai — blank screen (no flash)
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="features" options={{ headerShown: false }} />
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
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <InitialLayout />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
