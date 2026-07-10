import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="report/new" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="report/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
