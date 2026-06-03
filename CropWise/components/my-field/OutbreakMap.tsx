import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { OutbreakAlert } from '../../types/outbreak';
import GlassCard from '../ui/GlassCard';

type Props = {
  outbreaks: OutbreakAlert[];
};

const severityColors: Record<OutbreakAlert['severity'], { fill: string; stroke: string }> = {
  low: {
    fill: 'rgba(52, 211, 153, 0.25)', // emerald-400
    stroke: 'rgba(52, 211, 153, 0.8)',
  },
  medium: {
    fill: 'rgba(251, 191, 36, 0.25)', // amber-400
    stroke: 'rgba(251, 191, 36, 0.8)',
  },
  high: {
    fill: 'rgba(248, 113, 113, 0.25)', // red-400
    stroke: 'rgba(248, 113, 113, 0.9)',
  },
};

export const OutbreakMap: React.FC<Props> = ({ outbreaks }) => {
  if (!outbreaks.length) return null;

  const focus = outbreaks[0];
  const initialRegion: Region = useMemo(
    () => ({
      latitude: focus.center.latitude,
      longitude: focus.center.longitude,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    }),
    [focus.center.latitude, focus.center.longitude]
  );

  return (
    <GlassCard intensity={20} style={styles.container}>
      <Text style={styles.title}>Bản đồ vùng cảnh báo</Text>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {outbreaks.map((alert) => {
          const palette = severityColors[alert.severity];
          return (
            <React.Fragment key={alert.id}>
              <Circle
                center={alert.center}
                radius={alert.radiusMeters}
                fillColor={palette.fill}
                strokeColor={palette.stroke}
                strokeWidth={2}
              />
              <Marker
                coordinate={alert.center}
                title={alert.title}
                description={`Bán kính ${Math.round(alert.radiusMeters / 100) / 10} km`}
              />
            </React.Fragment>
          );
        })}
      </MapView>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  map: {
    height: 240,
    width: '100%',
  },
});


