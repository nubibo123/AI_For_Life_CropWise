import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
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
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
