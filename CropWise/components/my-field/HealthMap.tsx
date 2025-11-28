import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field } from '../../types/field';

export type HeatCell = {
  id: string;
  // giữ lại tọa độ để tương thích với dữ liệu cũ, nhưng không còn dùng cho UI
  coordinates: { latitude: number; longitude: number }[];
  fillColor: string;
  strokeColor?: string;
};

export type ScanStatus = 'idle' | 'connecting' | 'analyzing' | 'complete';

type Props = {
  field: Field;
  heatmapCells: HeatCell[];
  scanStatus: ScanStatus;
  statusMessage?: string;
};

const GRID_COLUMNS = 5;

export const HealthMap: React.FC<Props> = ({ heatmapCells, scanStatus, statusMessage }) => {
  const rows = useMemo(() => {
    const grouped: HeatCell[][] = [];
    for (let i = 0; i < heatmapCells.length; i += GRID_COLUMNS) {
      grouped.push(heatmapCells.slice(i, i + GRID_COLUMNS));
    }
    return grouped;
  }, [heatmapCells]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.gridBackground}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {row.map((cell) => (
              <View key={cell.id} style={styles.gridCell}>
                <View style={[styles.cellFill, { backgroundColor: cell.fillColor }]} />
              </View>
            ))}
          </View>
        ))}
      </View>

      {(scanStatus === 'connecting' || scanStatus === 'analyzing') && (
        <View style={styles.overlay}>
          <View style={styles.overlayBadge}>
            <Text style={styles.overlayTitle}>
              {scanStatus === 'connecting' ? 'Đang kết nối Drone…' : 'Đang phân tích hình ảnh…'}
            </Text>
            {statusMessage && <Text style={styles.overlaySubtitle}>{statusMessage}</Text>}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0f172a',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  gridBackground: {
    flex: 1,
    padding: 10,
    gap: 8,
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  gridCell: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  cellFill: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBadge: {
    backgroundColor: 'rgba(17, 24, 39, 0.85)',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  overlayTitle: {
    color: '#f3f4f6',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'center',
  },
  overlaySubtitle: {
    color: '#d1d5db',
    fontSize: 13,
    textAlign: 'center',
  },
});

