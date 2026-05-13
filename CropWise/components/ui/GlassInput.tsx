import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle | ViewStyle[] | any;
}

export default function GlassInput({ icon, rightIcon, onRightIconPress, containerStyle, style, ...props }: GlassInputProps) {
  return (
    <BlurView intensity={30} tint="dark" style={[styles.container, containerStyle]}>
      {icon && <Ionicons name={icon} size={20} color="#E0E0E0" style={styles.icon} />}
      <TextInput
        placeholderTextColor="#B0B0B0"
        style={[styles.input, style]}
        {...props}
      />
      {rightIcon && (
        <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
          <Ionicons name={rightIcon} size={20} color="#E0E0E0" />
        </TouchableOpacity>
      )}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  rightIcon: {
    padding: 4,
    marginLeft: 8,
  },
});
