import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "../contexts/AuthContext";
import GlassBackground from "../components/ui/GlassBackground";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GlassBackground>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="community/[id]" />
              <Stack.Screen name="community/create" />
              <Stack.Screen name="notifications" />
              <Stack.Screen name="diseases/index" />
              <Stack.Screen name="diseases/[id]" />
            </Stack>
          </AuthProvider>
        </GlassBackground>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
