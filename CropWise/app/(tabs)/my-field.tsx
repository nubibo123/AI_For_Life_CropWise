import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import { AlertCircle, AlertTriangle, CloudRain, PlusCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { LatLng, Marker, Region } from 'react-native-maps';
import { FieldCard } from '../../components/my-field/FieldCard';
import { HealthMap, HeatCell, ScanStatus } from '../../components/my-field/HealthMap';
import { OutbreakMap } from '../../components/my-field/OutbreakMap';
import { ScanButton } from '../../components/my-field/ScanButton';
import { useAuth } from '../../contexts/AuthContext';
import { addField, CreateFieldInput, getMyFields, updateFieldScan } from '../../services/fieldService';
import { createOutbreakAlert, OutbreakUtils, subscribeToOutbreakAlerts } from '../../services/outbreakService';
import { getWeatherByCoords, WeatherData } from '../../services/weatherService';
import { Field } from '../../types/field';
import { OutbreakAlert, OutbreakSeverity } from '../../types/outbreak';

const DEFAULT_COORD = { latitude: 21.028511, longitude: 105.804817 };

type ScanSummary = {
  score: number;
  issues: string[];
  finding: string;
  label: string;
};

type AlertFormState = {
  title: string;
  description: string;
  radius: string;
  severity: OutbreakSeverity;
};

const severityLabels: Record<OutbreakSeverity, string> = {
  low: 'Nguy cơ thấp',
  medium: 'Cảnh báo',
  high: 'Nguy cấp',
};

export default function MyFieldScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [fields, setFields] = useState<Field[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [heatmapCells, setHeatmapCells] = useState<HeatCell[]>([]);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>([]);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [alertForm, setAlertForm] = useState<AlertFormState>({
    title: '',
    description: '',
    radius: '1500',
    severity: 'medium' as OutbreakSeverity,
  });

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [formState, setFormState] = useState({
    name: '',
    cropType: '',
    area: '',
    sowingDate: new Date(),
    location: DEFAULT_COORD,
  });

  const primaryField = useMemo(() => fields[0] ?? null, [fields]);

  const clearScheduledTasks = () => {
    timeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutsRef.current = [];
  };

  useEffect(
    () => () => {
      clearScheduledTasks();
    },
    []
  );

  useEffect(() => {
    const unsubscribe = subscribeToOutbreakAlerts((alerts) => setOutbreaks(alerts));
    return unsubscribe;
  }, []);

  const fetchFields = useCallback(async () => {
    if (!user) return;
    setLoadingFields(true);
    try {
      const data = await getMyFields(user.id);
      setFields([...data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load fields', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách ruộng lúc này.');
    } finally {
      setLoadingFields(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  useEffect(() => {
    const loadWeather = async () => {
      if (!primaryField) {
        setWeather(null);
        return;
      }
      setWeatherLoading(true);
      try {
        const data = await getWeatherByCoords(
          primaryField.location.latitude,
          primaryField.location.longitude
        );
        setWeather(data);
      } finally {
        setWeatherLoading(false);
      }
    };
    loadWeather();
  }, [primaryField?.id]);

  const resetForm = () => {
    setFormState({
      name: '',
      cropType: '',
      area: '',
      sowingDate: new Date(),
      location: DEFAULT_COORD,
    });
    setFormError(null);
  };

  const resetAlertForm = () => {
    setAlertForm({
      title: '',
      description: '',
      radius: '1500',
      severity: 'medium',
    });
    setAlertError(null);
  };

  const isWithinAlert = useCallback(
    (alert: OutbreakAlert) => {
      if (!primaryField) return false;
      return (
        OutbreakUtils.getDistanceMeters(primaryField.location, alert.center) <= alert.radiusMeters
      );
    },
    [primaryField]
  );

  const formatAlertDate = (alert: OutbreakAlert) => {
    if (!alert.createdAt || !('toDate' in alert.createdAt)) return '';
    const date = (alert.createdAt as Timestamp).toDate();
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddField = async () => {
    if (!user) return;
    if (!formState.name.trim() || !formState.area.trim() || !formState.cropType.trim()) {
      setFormError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    const parsedArea = Number(formState.area.replace(',', '.'));
    if (Number.isNaN(parsedArea) || parsedArea <= 0) {
      setFormError('Diện tích phải là số hợp lệ.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateFieldInput = {
        userId: user.id,
        name: formState.name.trim(),
        cropType: formState.cropType.trim(),
        area: parsedArea,
        sowingDate: Timestamp.fromDate(formState.sowingDate),
        location: formState.location,
        status: 'active',
      };
      const newField = await addField(payload);
      setFields((prev) => [newField, ...prev]);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add field', error);
      Alert.alert('Lỗi', 'Không thể lưu ruộng mới. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!primaryField) {
      Alert.alert('Chưa có ruộng', 'Vui lòng thêm ít nhất một thửa ruộng trước khi cảnh báo.');
      return;
    }
    if (!alertForm.title.trim() || !alertForm.description.trim()) {
      setAlertError('Vui lòng nhập tiêu đề và mô tả chi tiết.');
      return;
    }
    const radiusMeters = Number(alertForm.radius);
    if (Number.isNaN(radiusMeters) || radiusMeters <= 0) {
      setAlertError('Bán kính phải là số hợp lệ (mét).');
      return;
    }
    setAlertSubmitting(true);
    try {
      await createOutbreakAlert({
        title: alertForm.title.trim(),
        description: alertForm.description.trim(),
        severity: alertForm.severity,
        radiusMeters,
        center: primaryField.location,
        fieldId: primaryField.id,
        creatorName: user?.name,
      });
      setAlertModalVisible(false);
      resetAlertForm();
    } catch (error) {
      console.error('Failed to create outbreak alert', error);
      Alert.alert('Lỗi', 'Không thể gửi cảnh báo. Vui lòng thử lại sau.');
    } finally {
      setAlertSubmitting(false);
    }
  };

  const schedule = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(callback, delay);
    timeoutsRef.current.push(timeoutId);
  };

  const generateHeatmapCells = (center: LatLng): HeatCell[] => {
    const latSteps = [-2, -1, 0, 1];
    const lngSteps = [-2, -1, 0, 1, 2];
    const delta = 0.00025;
    const half = delta / 1.2;
    const totalCells = latSteps.length * lngSteps.length; // 20
    const yellowSlots = new Set([5, 12]);
    const redCluster = new Set([totalCells - 2, totalCells - 1]);

    const cells: HeatCell[] = [];
    let index = 0;
    for (const latStep of latSteps) {
      for (const lngStep of lngSteps) {
        const baseLat = center.latitude + latStep * delta;
        const baseLng = center.longitude + lngStep * delta;
        let fillColor = 'rgba(34, 197, 94, 0.4)'; // green
        if (yellowSlots.has(index)) {
          fillColor = 'rgba(250, 204, 21, 0.4)';
        }
        if (redCluster.has(index)) {
          fillColor = 'rgba(239, 68, 68, 0.4)';
        }
        cells.push({
          id: `cell-${index}`,
          coordinates: [
            { latitude: baseLat - half, longitude: baseLng - half },
            { latitude: baseLat - half, longitude: baseLng + half },
            { latitude: baseLat + half, longitude: baseLng + half },
            { latitude: baseLat + half, longitude: baseLng - half },
          ],
          fillColor,
          strokeColor: 'rgba(255,255,255,0.4)',
        });
        index += 1;
      }
    }
    return cells;
  };

  const handleStartScan = () => {
    if (!primaryField) return;
    clearScheduledTasks();
    setScanStatus('connecting');
    setStatusMessage('Đang thiết lập kênh truyền với Drone CropWise…');
    setHeatmapCells([]);
    setScanSummary(null);
    setResultVisible(false);

    schedule(() => {
      setScanStatus('analyzing');
      setStatusMessage('Thu thập phổ NDVI & phân tích ảnh vệ tinh độ phân giải cao.');
    }, 1200);

    schedule(async () => {
      const cells = generateHeatmapCells(primaryField.location);
      setHeatmapCells(cells);
      const scoreBase = 78 + Math.round(Math.random() * 12);
      const summary: ScanSummary = {
        score: scoreBase,
        issues: [
          'Thiếu đạm nhẹ tại trung tâm ruộng',
          'Ổ dịch Đốm lá lớn ở góc Đông Bắc',
        ],
        finding: 'Phát hiện: 1 ổ dịch Đốm lá lớn ở góc Đông Bắc.',
        label: scoreBase > 82 ? 'Sức khỏe tốt' : 'Cần theo dõi',
      };
      setScanStatus('complete');
      setStatusMessage(undefined);
      setScanSummary(summary);
      setResultVisible(true);

      try {
        const scanPayload = {
          scanDate: Timestamp.now(),
          healthScore: summary.score,
          issues: summary.issues,
        };
        await updateFieldScan(primaryField.id, scanPayload);
        setFields((prev) =>
          prev.map((field) =>
            field.id === primaryField.id ? { ...field, lastScanResult: scanPayload } : field
          )
        );
      } catch (error) {
        console.error('Failed to persist scan result', error);
      }
    }, 3200);
  };

  const rainAlert = weather?.rainVolume !== undefined && weather?.rainVolume > 10;

  if (loadingFields) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Đang tải ruộng của bạn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!primaryField ? (
        <EmptyState onAdd={() => setModalVisible(true)} />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <Text style={styles.screenTitle}>Ruộng của tôi</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <PlusCircle size={18} color="#10b981" />
                <Text style={styles.addButtonText}>Thêm ruộng</Text>
              </TouchableOpacity>
            </View>

            <FieldCard field={primaryField} />

            <WeatherWidget weather={weather} loading={weatherLoading} rainAlert={!!rainAlert} />

            {outbreaks.length > 0 && (
              <>
                <OutbreakMap outbreaks={outbreaks.slice(0, 3)} />
                <View style={styles.alertListHeader}>
                  <Text style={styles.sectionTitle}>Cảnh báo cộng đồng</Text>
                  <Text style={styles.alertListSubtitle}>
                    Cập nhật mới nhất từ cộng đồng trồng ngô quanh bạn
                  </Text>
                </View>
                {outbreaks.map((alert) => {
                  const within = isWithinAlert(alert);
                  return (
                    <View key={alert.id} style={styles.alertCard}>
                      <View style={styles.alertCardHeader}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <View
                          style={[
                            styles.severityPill,
                            alert.severity === 'high'
                              ? styles.severityHigh
                              : alert.severity === 'medium'
                              ? styles.severityMedium
                              : styles.severityLow,
                          ]}
                        >
                          <Text style={styles.severityPillText}>{severityLabels[alert.severity]}</Text>
                        </View>
                      </View>
                      <Text style={styles.alertDescription}>{alert.description}</Text>
                      <Text style={styles.alertMeta}>
                        Bán kính {Math.round(alert.radiusMeters / 100) / 10} km •{' '}
                        {formatAlertDate(alert)}
                      </Text>
                      <Text style={styles.alertMetaSecondary}>
                        Bởi {alert.creatorName ?? 'Nông dân CropWise'}
                      </Text>
                      {within && (
                        <View style={styles.alertWarning}>
                          <AlertTriangle size={16} color="#b91c1c" />
                          <Text style={styles.alertWarningText}>
                            Ruộng của bạn nằm trong vùng cảnh báo
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}

            <HealthMap
              field={primaryField}
              heatmapCells={heatmapCells}
              scanStatus={scanStatus}
              statusMessage={statusMessage}
            />

            {resultVisible && scanSummary && (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>
                  {scanSummary.label}: {scanSummary.score}%
                </Text>
                <Text style={styles.resultSubtitle}>{scanSummary.finding}</Text>
                {scanSummary.issues.map((issue) => (
                  <View key={issue} style={styles.issueRow}>
                    <AlertCircle size={16} color="#ef4444" />
                    <Text style={styles.issueText}>{issue}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.outlineButton} onPress={() => router.push('/diseases')}>
                  <Text style={styles.outlineButtonText}>Xem phác đồ xử lý</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <ScanButton
            onPress={handleStartScan}
            loading={scanStatus === 'connecting' || scanStatus === 'analyzing'}
          />
          <ScanButton
            onPress={() => setAlertModalVisible(true)}
            label="Cảnh báo ổ dịch"
            icon={<AlertTriangle size={20} color="#fff" />}
            position="left"
            style={{ backgroundColor: '#ef4444', shadowColor: '#ef4444' }}
            loading={alertSubmitting && alertModalVisible}
            disabled={alertSubmitting}
          />
        </>
      )}

      <FieldModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        formState={formState}
        setFormState={setFormState}
        onSubmit={handleAddField}
        submitting={submitting}
        formError={formError}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
      />

      <OutbreakModal
        visible={alertModalVisible}
        onClose={() => {
          setAlertModalVisible(false);
          resetAlertForm();
        }}
        formState={alertForm}
        setFormState={setAlertForm}
        onSubmit={handleCreateAlert}
        submitting={alertSubmitting}
        error={alertError}
        onClearError={() => setAlertError(null)}
      />
    </View>
  );
}

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <View style={styles.emptyContainer}>
    <Image source={require('../../assets/images/partial-react-logo.png')} style={styles.emptyImage} />
    <Text style={styles.emptyTitle}>Chưa có thửa ruộng nào</Text>
    <Text style={styles.emptyDescription}>
      Bắt đầu theo dõi sức khỏe cây trồng và thời tiết ngay khi bạn thêm thửa ruộng đầu tiên.
    </Text>
    <TouchableOpacity style={styles.primaryButton} onPress={onAdd}>
      <Text style={styles.primaryButtonText}>Thêm thửa ruộng mới</Text>
    </TouchableOpacity>
  </View>
);

const WeatherWidget: React.FC<{
  weather: WeatherData | null;
  loading: boolean;
  rainAlert: boolean;
}> = ({ weather, loading, rainAlert }) => (
  <View
    style={[
      styles.weatherCard,
      rainAlert && {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
      },
    ]}
  >
    {loading ? (
      <View style={styles.weatherLoading}>
        <ActivityIndicator color="#10b981" />
        <Text style={styles.loadingText}>Đang cập nhật thời tiết...</Text>
      </View>
    ) : weather ? (
      <>
        <View>
          <Text style={styles.weatherTitle}>{weather.cityName}</Text>
          <Text style={styles.weatherSubtitle}>{weather.description}</Text>
          <View style={styles.weatherTempRow}>
            <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
            <Text style={styles.weatherRange}>
              {weather.tempMin}° / {weather.tempMax}°
            </Text>
          </View>
        </View>
        <View style={styles.weatherRight}>
          <View style={styles.weatherMetric}>
            <CloudRain size={18} color={rainAlert ? '#ef4444' : '#0ea5e9'} />
            <Text
              style={[
                styles.weatherMetricText,
                rainAlert && { color: '#b91c1c', fontWeight: '700' },
              ]}
            >
              Mưa dự báo: {(weather.rainVolume ?? 0).toFixed(1)} mm
            </Text>
          </View>
          <Text style={styles.weatherDate}>Cập nhật {weather.date}</Text>
          {rainAlert && <Text style={styles.weatherAlert}>⚠️ Cảnh báo mưa lớn & nguy cơ nấm bệnh</Text>}
        </View>
      </>
    ) : (
      <Text style={styles.weatherSubtitle}>Không lấy được dữ liệu thời tiết.</Text>
    )}
  </View>
);

type FieldModalProps = {
  visible: boolean;
  onClose: () => void;
  formState: {
    name: string;
    cropType: string;
    area: string;
    sowingDate: Date;
    location: LatLng;
  };
  setFormState: React.Dispatch<
    React.SetStateAction<{
      name: string;
      cropType: string;
      area: string;
      sowingDate: Date;
      location: LatLng;
    }>
  >;
  onSubmit: () => void;
  submitting: boolean;
  formError: string | null;
  showDatePicker: boolean;
  setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
};

const FieldModal: React.FC<FieldModalProps> = ({
  visible,
  onClose,
  formState,
  setFormState,
  onSubmit,
  submitting,
  formError,
  showDatePicker,
  setShowDatePicker,
}) => {
  const miniMapRegion: Region = {
    ...formState.location,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm thửa ruộng mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.inputLabel}>Tên ruộng</Text>
            <TextInput
              placeholder="VD: Ruộng Bãi Bồi"
              style={styles.input}
              value={formState.name}
              onChangeText={(name) => setFormState((prev) => ({ ...prev, name }))}
            />

            <Text style={styles.inputLabel}>Giống cây</Text>
            <TextInput
              placeholder="VD: Ngô NK7328"
              style={styles.input}
              value={formState.cropType}
              onChangeText={(cropType) => setFormState((prev) => ({ ...prev, cropType }))}
            />

            <Text style={styles.inputLabel}>Diện tích (m²)</Text>
            <TextInput
              placeholder="VD: 5000"
              keyboardType="numeric"
              style={styles.input}
              value={formState.area}
              onChangeText={(area) => setFormState((prev) => ({ ...prev, area }))}
            />

            <Text style={styles.inputLabel}>Ngày gieo</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {formState.sowingDate.toLocaleDateString('vi-VN')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={formState.sowingDate}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setFormState((prev) => ({ ...prev, sowingDate: date }));
                  }
                }}
              />
            )}

            <Text style={styles.inputLabel}>Chọn vị trí trên bản đồ</Text>
            <View style={styles.miniMapWrapper}>
              <MapView style={StyleSheet.absoluteFill} initialRegion={miniMapRegion}>
                <Marker
                  draggable
                  coordinate={formState.location}
                  onDragEnd={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      location: event.nativeEvent.coordinate,
                    }))
                  }
                />
              </MapView>
            </View>

            {formError && <Text style={styles.errorText}>{formError}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, submitting && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Lưu thửa ruộng</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

type OutbreakModalProps = {
  visible: boolean;
  onClose: () => void;
  formState: AlertFormState;
  setFormState: React.Dispatch<React.SetStateAction<AlertFormState>>;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  onClearError: () => void;
};

const OutbreakModal: React.FC<OutbreakModalProps> = ({
  visible,
  onClose,
  formState,
  setFormState,
  onSubmit,
  submitting,
  error,
  onClearError,
}) => {
  const severityOptions: { value: OutbreakSeverity; label: string }[] = [
    { value: 'low', label: 'Nguy cơ thấp' },
    { value: 'medium', label: 'Cảnh báo' },
    { value: 'high', label: 'Nguy cấp' },
  ];

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cảnh báo ổ dịch</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Đóng</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Text style={styles.inputLabel}>Tiêu đề cảnh báo</Text>
            <TextInput
              placeholder="VD: Ổ dịch đốm lá đang lan nhanh"
              style={styles.input}
              value={formState.title}
              onChangeText={(title) => {
                setFormState((prev) => ({ ...prev, title }));
                onClearError();
              }}
            />

            <Text style={styles.inputLabel}>Mô tả chi tiết</Text>
            <TextInput
              placeholder="Chia sẻ thêm về triệu chứng, phạm vi phát hiện..."
              style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
              value={formState.description}
              onChangeText={(description) => {
                setFormState((prev) => ({ ...prev, description }));
                onClearError();
              }}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.inputLabel}>Mức độ nghiêm trọng</Text>
            <View style={styles.severityRow}>
              {severityOptions.map((option) => {
                const active = formState.severity === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.severityOption, active && styles.severityOptionActive]}
                    onPress={() => {
                      setFormState((prev) => ({ ...prev, severity: option.value }));
                      onClearError();
                    }}
                  >
                    <Text
                      style={[
                        styles.severityOptionText,
                        active && styles.severityOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Bán kính cảnh báo (m)</Text>
            <TextInput
              placeholder="VD: 1500"
              keyboardType="numeric"
              style={styles.input}
              value={formState.radius}
              onChangeText={(radius) => {
                setFormState((prev) => ({ ...prev, radius }));
                onClearError();
              }}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.primaryButton, submitting && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Gửi cảnh báo</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  addButtonText: {
    color: '#047857',
    fontWeight: '600',
  },
  weatherCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  weatherSubtitle: {
    color: '#475569',
    marginTop: 4,
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 12,
  },
  weatherTemp: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0f172a',
  },
  weatherRange: {
    color: '#475569',
    fontWeight: '600',
  },
  weatherRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  weatherMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherMetricText: {
    color: '#0369a1',
    fontWeight: '600',
  },
  weatherDate: {
    marginTop: 8,
    color: '#6b7280',
  },
  weatherAlert: {
    marginTop: 12,
    color: '#b91c1c',
    fontWeight: '700',
  },
  alertListHeader: {
    marginBottom: 8,
  },
  alertListSubtitle: {
    color: '#64748b',
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  severityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  severityPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  severityLow: {
    backgroundColor: 'rgba(34,197,94,0.2)',
  },
  severityMedium: {
    backgroundColor: 'rgba(250,204,21,0.25)',
  },
  severityHigh: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  alertDescription: {
    color: '#475569',
    marginBottom: 6,
  },
  alertMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  alertMetaSecondary: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  alertWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 10,
    borderRadius: 10,
  },
  alertWarningText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  resultSubtitle: {
    color: '#475569',
    marginTop: 6,
    marginBottom: 12,
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  issueText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  outlineButton: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#0f172a',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  weatherLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#475569',
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#475569',
    marginVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#10b981',
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    color: '#0f172a',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 12,
    padding: 12,
  },
  dateText: {
    fontWeight: '600',
    color: '#0f172a',
  },
  miniMapWrapper: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#e2e8f0',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  severityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center',
  },
  severityOptionActive: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderColor: '#ef4444',
  },
  severityOptionText: {
    color: '#475569',
    fontWeight: '600',
  },
  severityOptionTextActive: {
    color: '#b91c1c',
  },
  errorText: {
    color: '#b91c1c',
    marginTop: 6,
  },
});

