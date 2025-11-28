import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { OutbreakAlert } from '../../types/outbreak';

type Props = {
  outbreaks: OutbreakAlert[];
};

const severityColors: Record<OutbreakAlert['severity'], { fill: string; stroke: string }> = {
  low: {
    fill: 'rgba(34, 197, 94, 0.25)',
    stroke: 'rgba(34, 197, 94, 0.8)',
  },
  medium: {
    fill: 'rgba(250, 204, 21, 0.25)',
    stroke: 'rgba(234, 179, 8, 0.8)',
  },
  high: {
    fill: 'rgba(239, 68, 68, 0.25)',
    stroke: 'rgba(239, 68, 68, 0.9)',
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
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  map: {
    height: 240,
    width: '100%',
  },
});

