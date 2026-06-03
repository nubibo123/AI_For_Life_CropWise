import { Sprout, ThermometerSun, Waves } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Field } from '../../types/field';
import GlassCard from '../ui/GlassCard';

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
    <GlassCard intensity={20} style={styles.card}>
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
          <Sprout size={20} color="#81C784" />
          <View>
            <Text style={styles.metaLabel}>Ngày tuổi</Text>
            <Text style={styles.metaValue}>{days} ngày</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <ThermometerSun size={20} color="#FFD54F" />
          <View>
            <Text style={styles.metaLabel}>Diện tích</Text>
            <Text style={styles.metaValue}>{formatNumber(field.area)} m²</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Waves size={20} color="#64B5F6" />
          <View>
            <Text style={styles.metaLabel}>Lần quét</Text>
            <Text style={styles.metaValue}>
              {field.lastScanResult?.scanDate
                ? `${field.lastScanResult.scanDate.toDate().toLocaleDateString('vi-VN')}`
                : 'Chưa có'}
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFF',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    marginTop: 4,
    fontSize: 14,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: 'rgba(129, 199, 132, 0.15)',
    borderColor: 'rgba(129, 199, 132, 0.3)',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusText: {
    color: '#81C784',
    fontWeight: '700',
    fontSize: 12,
  },
  statusTextInactive: {
    color: 'rgba(255, 255, 255, 0.5)',
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
    gap: 8,
  },
  metaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
});

