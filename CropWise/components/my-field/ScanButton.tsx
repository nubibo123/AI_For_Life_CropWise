import { Radar } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type Props = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  label?: string;
  icon?: React.ReactNode;
  position?: 'left' | 'right';
};

export const ScanButton: React.FC<Props> = ({
  onPress,
  disabled,
  loading,
  style,
  label = 'Quét sức khỏe',
  icon,
  position = 'right',
}) => {
  const isDisabled = disabled || loading;
  const renderIcon = icon ?? <Radar size={20} color="#fff" />;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        position === 'left' ? styles.leftButton : styles.rightButton,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {renderIcon}
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  rightButton: {
    right: 24,
  },
  leftButton: {
    left: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  label: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

