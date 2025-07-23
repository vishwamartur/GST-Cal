import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { setupNotificationListeners } from '@/utils/notificationService';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Set up notification listeners
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
