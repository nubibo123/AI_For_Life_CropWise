import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[] | any;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export default function GlassCard({ children, style, intensity = 40, tint = 'dark' }: GlassCardProps) {
  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.card, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
  },
});
