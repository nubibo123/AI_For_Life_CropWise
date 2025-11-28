import { Sprout, ThermometerSun, Waves } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field } from '../../types/field';

type Props = {
  field: Field;
};

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('vi-VN').format(value);

const getDaysSinceSowing = (field: Field): number => {
  const sowingDate = field.sowingDate.toDate();
  const diff = Date.now() - sowingDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
};

export const FieldCard: React.FC<Props> = ({ field }) => {
  const days = getDaysSinceSowing(field);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{field.name}</Text>
          <Text style={styles.subtitle}>{field.cropType}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            field.status === 'active' ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              field.status !== 'active' && styles.statusTextInactive,
            ]}
          >
            {field.status === 'active' ? 'Đang canh tác' : 'Đã thu hoạch'}
          </Text>
        </View>
      </View>

      <View style={styles.metas}>
        <View style={styles.metaItem}>
          <Sprout size={20} color="#34d399" />
          <View>
            <Text style={styles.metaLabel}>Ngày tuổi</Text>
            <Text style={styles.metaValue}>{days} ngày</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <ThermometerSun size={20} color="#fcd34d" />
          <View>
            <Text style={styles.metaLabel}>Diện tích</Text>
            <Text style={styles.metaValue}>{formatNumber(field.area)} m²</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Waves size={20} color="#60a5fa" />
          <View>
            <Text style={styles.metaLabel}>Lần quét gần nhất</Text>
            <Text style={styles.metaValue}>
              {field.lastScanResult?.scanDate
                ? `${field.lastScanResult.scanDate.toDate().toLocaleDateString('vi-VN')}`
                : 'Chưa có'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    fontSize: 14,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  statusText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 12,
  },
  statusTextInactive: {
    color: '#374151',
  },
  metas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
});

