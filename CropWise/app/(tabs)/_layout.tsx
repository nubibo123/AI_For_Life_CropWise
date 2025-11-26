import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { user, initializing } = useAuth();
  const insets = useSafeAreaInsets();

  if (initializing) {
    return null;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          paddingTop: 5,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 0),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cây trồng',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'leaf' : 'leaf-outline'} size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="fertilizer"
        options={{
          title: 'Phân bón',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "flask" : "flask-outline"} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          title: 'Cộng đồng',
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Tôi',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
