import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface GlassBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function GlassBackground({ children, style }: GlassBackgroundProps) {
  return (
    <LinearGradient
      // Premium vibrant dark purple/blue/magenta palette to match glassmorphism aesthetic
      colors={['#1E1366', '#2A0845', '#6441A5', '#F27121']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
