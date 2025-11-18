import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { checkAPIStatus, predictDisease, PredictionResult } from '../../services/diseaseService';
import { getDiseaseIdByApiName } from '../../services/maizeDiseases';
import { getWeatherByCoords, WeatherData } from '../../services/weatherService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      
      // Nếu đã có quyền, tự động lấy thời tiết
      if (status === 'granted') {
        fetchWeather();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      console.log('Location:', location.coords);
      
      // Lưu thông tin vị trí
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      
      const weatherData = await getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      console.log('Weather data:', weatherData);

      if (weatherData) {
        setWeather(weatherData);
      } else {
        alert('Không thể lấy dữ liệu thời tiết. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Lỗi khi lấy thông tin thời tiết: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationAndFetchWeather = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Xin lỗi, chúng tôi cần quyền truy cập vị trí để cung cấp thông tin thời tiết!');
        setLoading(false);
        return;
      }

      setLocationGranted(true);
      await fetchWeather();
    } catch (error) {
      console.error('Error requesting location:', error);
      alert('Không thể yêu cầu quyền vị trí. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập camera!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Tự động phân tích bệnh sau khi chụp ảnh
      await analyzeDiseaseFromImage(imageUri);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Tự động phân tích bệnh sau khi chọn ảnh
      await analyzeDiseaseFromImage(imageUri);
    }
  };

  const analyzeDiseaseFromImage = async (imageUri: string) => {
    try {
      setPredicting(true);
      console.log('🔍 Đang phân tích bệnh...');

      // Kiểm tra API có sẵn không
      const apiAvailable = await checkAPIStatus();
      if (!apiAvailable) {
        alert('⚠️ Không thể kết nối đến server AI. Vui lòng đảm bảo server đang chạy!');
        setPredicting(false);
        return;
      }

      const result = await predictDisease(imageUri);

      if (result && result.success) {
        setPredictionResult(result);
        setShowResultModal(true);
        console.log('✅ Phân tích thành công:', result.predicted_class_vi);
      } else {
        alert('❌ Không thể phân tích ảnh. Vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error analyzing disease:', error);
      alert('Lỗi khi phân tích: ' + error);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CropWise</Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          {locationGranted && (
            <TouchableOpacity onPress={fetchWeather} disabled={loading}>
              <Ionicons 
                name="refresh" 
                size={24} 
                color={loading ? "#ccc" : "#333"} 
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Weather Card */}
        <View style={styles.weatherCard}>
          {loading ? (
            <ActivityIndicator size="large" color="#F9A825" />
          ) : weather ? (
            <>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherTitle}>Hôm nay, {weather.date}</Text>
                <Text style={styles.weatherSubtitle}>
                  {weather.description} • {weather.temp}°C / {weather.tempMin}°C
                </Text>
                <Text style={styles.weatherCity}>{weather.cityName}</Text>
                {currentLocation && (
                  <Text style={styles.weatherLocation}>
                    📍 {currentLocation.latitude.toFixed(2)}°N, {currentLocation.longitude.toFixed(2)}°E
                  </Text>
                )}
              </View>
              <View style={styles.weatherRight}>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Image
                  source={{ uri: weather.icon }}
                  style={styles.weatherIcon}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherTitle}>Hôm nay, 31 Th10</Text>
                <Text style={styles.weatherSubtitle}>Nhấn "Cho phép" để xem thời tiết</Text>
              </View>
              <View style={styles.weatherRight}>
                <Ionicons name="cloud-outline" size={50} color="#F9A825" />
              </View>
            </>
          )}
        </View>

        {/* Location Permission Card */}
        {!locationGranted && (
          <View style={styles.locationCard}>
            <View style={styles.locationContent}>
              <Ionicons name="location" size={24} color="#666" />
              <Text style={styles.locationText}>Yêu cầu cho phép định vị</Text>
            </View>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={requestLocationAndFetchWeather}
              disabled={loading}
            >
              <Text style={styles.locationButtonText}>
                {loading ? 'Đang tải...' : 'Cho phép'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Disease Detection Section */}
        <View style={styles.diseaseSection}>
          <Text style={styles.sectionTitle}>Chữa cho cây trồng</Text>

          <View style={styles.processContainer}>
            <View style={styles.processStep}>
              <View style={styles.processIcon}>
                <Ionicons name="leaf" size={40} color="#2C5F2D" />
              </View>
              <Text style={styles.processLabel}>Chụp ảnh</Text>
            </View>

            <Ionicons name="chevron-forward" size={28} color="#ccc" />

            <View style={styles.processStep}>
              <View style={styles.processIcon}>
                <Ionicons name="document-text" size={40} color="#FF6B35" />
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              </View>
              <Text style={styles.processLabel}>Xem chẩn{'\n'}đoán</Text>
            </View>

            <Ionicons name="chevron-forward" size={28} color="#ccc" />

            <View style={styles.processStep}>
              <View style={styles.processIcon}>
                <Ionicons name="medical" size={40} color="#4CAF50" />
              </View>
              <Text style={styles.processLabel}>Lấy thuốc</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={pickImage}
            disabled={predicting}
          >
            <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.captureButtonText}>
              {predicting ? 'Đang phân tích...' : 'Chụp ảnh'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.captureButton, styles.galleryButton]} 
            onPress={pickImageFromGallery}
            disabled={predicting}
          >
            <Ionicons name="images" size={20} color="#2C5F2D" style={{ marginRight: 8 }} />
            <Text style={[styles.captureButtonText, styles.galleryButtonText]}>
              {predicting ? 'Đang phân tích...' : 'Chọn từ thư viện'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
          <View style={styles.featuresContainer}>
        <TouchableOpacity 
          style={styles.featureCard} 
          onPress={() => router.push('/fertilizer')} // ← chuyển sang màn hình fertilizer.tsx
        >
          <View style={styles.featureIconContainer}>
            <Ionicons name="calculator" size={28} color="#333" />
          </View>
          <Text style={styles.featureText}>Tính toán phân bón</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/diseases' as any)}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons name="bug" size={28} color="#333" />
            </View>
            <Text style={styles.featureText}>Sâu hại và Bệnh cây trồng</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={pickImage}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Modal hiển thị kết quả */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showResultModal}
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kết quả phân tích</Text>
              <TouchableOpacity onPress={() => setShowResultModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {predictionResult && (
              <ScrollView style={styles.modalBody}>
                {/* Ảnh đã phân tích */}
                {selectedImage && (
                  <Image source={{ uri: selectedImage }} style={styles.resultImage} />
                )}

                {/* Kết quả chính */}
                <View style={[
                  styles.resultCard,
                  predictionResult.predicted_class === 'Healthy' ? styles.healthyCard : styles.diseaseCard
                ]}>
                  <View style={styles.resultHeader}>
                    <Ionicons 
                      name={predictionResult.predicted_class === 'Healthy' ? 'checkmark-circle' : 'warning'} 
                      size={32} 
                      color={predictionResult.predicted_class === 'Healthy' ? '#4CAF50' : '#FF6B35'} 
                    />
                    <View style={styles.resultHeaderText}>
                      <Text style={styles.resultLabel}>Chẩn đoán:</Text>
                      <Text style={styles.resultDiseaseName}>{predictionResult.disease_info.name}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.confidenceBar}>
                    <Text style={styles.confidenceLabel}>Độ tin cậy:</Text>
                    <Text style={styles.confidenceValue}>{predictionResult.confidence.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${predictionResult.confidence}%` }
                      ]} 
                    />
                  </View>
                </View>

                {/* Mô tả bệnh */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>📋 Mô tả</Text>
                  <Text style={styles.infoText}>{predictionResult.disease_info.description}</Text>
                </View>

                {/* Phương pháp điều trị */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>💊 Phương pháp điều trị</Text>
                  <Text style={styles.infoText}>{predictionResult.disease_info.treatment}</Text>
                </View>

                {/* Nút xem chi tiết điều trị - chỉ hiện nếu bệnh có trong database */}
                {predictionResult.predicted_class !== 'Healthy' && getDiseaseIdByApiName(predictionResult.predicted_class_vi) && (
                  <TouchableOpacity 
                    style={styles.detailButton}
                    onPress={() => {
                      const diseaseId = getDiseaseIdByApiName(predictionResult.predicted_class_vi);
                      if (diseaseId) {
                        setShowResultModal(false);
                        router.push({ pathname: '/diseases/[id]', params: { id: diseaseId } });
                      }
                    }}
                  >
                    <Ionicons name="medical" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.detailButtonText}>Xem Cách Điều Trị Chi Tiết</Text>
                  </TouchableOpacity>
                )}

                {/* Xác suất các bệnh khác */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>📊 Chi tiết phân tích</Text>
                  {Object.entries(predictionResult.all_predictions).map(([disease, data]) => (
                    <View key={disease} style={styles.probabilityRow}>
                      <Text style={styles.probabilityLabel}>{disease}</Text>
                      <Text style={styles.probabilityValue}>{data.probability.toFixed(1)}%</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowResultModal(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Loading Modal khi đang phân tích */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={predicting}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingTitle}>Đang phân tích bệnh...</Text>
            <Text style={styles.loadingSubtitle}>Vui lòng đợi trong giây lát</Text>
            <View style={styles.loadingProgress}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, { animationDelay: '0.2s' }]} />
              <View style={[styles.loadingDot, { animationDelay: '0.4s' }]} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  weatherCard: {
    backgroundColor: '#FFF9C4',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F9A825',
  },
  weatherLeft: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  weatherSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  weatherCity: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  weatherLocation: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  weatherRight: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginTop: 5,
  },
  locationCard: {
    backgroundColor: '#FFE0B2',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  locationButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  diseaseSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  processContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 25,
  },
  processStep: {
    alignItems: 'center',
  },
  processIcon: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  checkmark: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  captureButton: {
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2C5F2D',
    marginTop: 10,
  },
  galleryButtonText: {
    color: '#2C5F2D',
  },
  featuresContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 30,
    paddingBottom: 80,
  },
  featureCard: {
    backgroundColor: '#E8EAF6',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  resultCard: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },
  healthyCard: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  diseaseCard: {
    backgroundColor: '#FFEBEE',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resultHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultDiseaseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  confidenceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  infoSection: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  probabilityLabel: {
    fontSize: 14,
    color: '#333',
  },
  probabilityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  detailButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingProgress: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});
