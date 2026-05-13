import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
import { BatchResponse, checkAPIStatus, predictDisease, PredictionResult } from '../../services/diseaseService';
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
  const [batchResults, setBatchResults] = useState<BatchResponse | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<{ uri: string; bbox?: number[] } | null>(null);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);

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

      // Kiểm tra quyền truy cập trước
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('⚠️ Vui lòng cấp quyền truy cập vị trí để xem thông tin thời tiết!');
        setLocationGranted(false);
        setLoading(false);
        return;
      }

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
    } catch (error: any) {
      console.error('Error fetching weather:', error);

      // Xử lý các loại lỗi cụ thể
      if (error.message?.includes('location') || error.message?.includes('Location')) {
        alert('📍 Không thể lấy vị trí.\n\nVui lòng:\n• Bật dịch vụ định vị trên thiết bị\n• Cho phép ứng dụng truy cập vị trí\n• Thử lại sau');
        setLocationGranted(false);
      } else {
        alert('❌ Lỗi khi lấy thông tin thời tiết.\n\nVui lòng kiểm tra kết nối internet và thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestLocationAndFetchWeather = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        alert('⚠️ Quyền truy cập vị trí bị từ chối\n\nĐể xem thông tin thời tiết, vui lòng:\n1. Vào Cài đặt thiết bị\n2. Tìm ứng dụng CropWise\n3. Bật quyền "Vị trí"');
        setLoading(false);
        return;
      }

      setLocationGranted(true);
      await fetchWeather();
    } catch (error: any) {
      console.error('Error requesting location:', error);
      alert('❌ Không thể yêu cầu quyền vị trí\n\nVui lòng:\n• Bật dịch vụ định vị trên thiết bị\n• Thử lại sau');
      setLoading(false);
    }
  };

  // Tiền xử lý ảnh để tăng độ chính xác
  const preprocessImage = async (imageUri: string): Promise<string> => {
    try {
      console.log('🔧 Đang tiền xử lý ảnh...');

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          // Resize về kích thước tối ưu (256x256 như model)
          { resize: { width: 256, height: 256 } }
        ],
        {
          compress: 0.9, // Giảm dung lượng nhưng giữ chất lượng
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      console.log('✅ Tiền xử lý hoàn tất');
      return manipResult.uri;
    } catch (error) {
      console.error('Lỗi khi tiền xử lý ảnh:', error);
      return imageUri; // Trả về ảnh gốc nếu có lỗi
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
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Tiền xử lý ảnh trước khi phân tích
      const processedUri = await preprocessImage(imageUri);
      await analyzeDiseaseFromImage(processedUri);
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
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      // Tiền xử lý ảnh trước khi phân tích
      const processedUri = await preprocessImage(imageUri);
      await analyzeDiseaseFromImage(processedUri);
    }
  };

  const pickMultipleImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUris = result.assets.map(asset => asset.uri);
      // Tiền xử lý tất cả ảnh trước khi phân tích batch
      console.log('� Đang tiền xử lý', imageUris.length, 'ảnh...');
      const processedUris = await Promise.all(
        imageUris.map(uri => preprocessImage(uri))
      );
      await analyzeDiseasesBatch(processedUris);
    }
  };

  const analyzeDiseasesBatch = async (imageUris: string[]) => {
    try {
      setPredicting(true);
      setShowBatchModal(true); // Mở modal ngay
      setBatchResults({ success: true, processed: 0, failed: 0, total: imageUris.length, results: [] }); // Khởi tạo empty

      console.log('🔍 Đang phân tích', imageUris.length, 'ảnh...');

      // Kiểm tra API có sẵn không
      const apiAvailable = await checkAPIStatus();
      if (!apiAvailable) {
        alert('⚠️ Không thể kết nối đến server AI. Vui lòng đảm bảo server đang chạy!');
        setPredicting(false);
        setShowBatchModal(false);
        return;
      }

      // Phân tích từng ảnh một và cập nhật kết quả ngay
      const allResults: any[] = [];
      let processed = 0;
      let failed = 0;

      for (let i = 0; i < imageUris.length; i++) {
        try {
          console.log(`🔍 Đang phân tích ảnh ${i + 1}/${imageUris.length}...`);

          const result = await predictDisease(imageUris[i]);

          if (result && result.success) {
            console.log(`📦 Ảnh ${i + 1} - leaf_bbox:`, result.leaf_bbox);
            allResults.push({
              filename: `image_${i + 1}`,
              success: true,
              predicted_class: result.predicted_class,
              predicted_class_vi: result.predicted_class_vi,
              confidence: result.confidence,
              disease_info: result.disease_info,
              all_predictions: result.all_predictions,
              leaf_bbox: result.leaf_bbox,
              imageUri: imageUris[i]
            });
            processed++;
          } else {
            allResults.push({
              filename: `image_${i + 1}`,
              success: false,
              error: 'Không thể phân tích ảnh',
              imageUri: imageUris[i]
            });
            failed++;
          }

          // Cập nhật kết quả ngay sau mỗi ảnh
          setBatchResults({
            success: true,
            processed,
            failed,
            total: imageUris.length,
            results: [...allResults]
          });

        } catch (error) {
          console.error(`Error analyzing image ${i + 1}:`, error);
          allResults.push({
            filename: `image_${i + 1}`,
            success: false,
            error: String(error),
            imageUri: imageUris[i]
          });
          failed++;

          // Cập nhật kết quả kể cả khi lỗi
          setBatchResults({
            success: true,
            processed,
            failed,
            total: imageUris.length,
            results: [...allResults]
          });
        }
      }

      console.log('✅ Phân tích hoàn tất:', processed, 'thành công,', failed, 'thất bại');

    } catch (error) {
      console.error('❌ Lỗi khi phân tích nhiều ảnh:', error);
      alert('Lỗi khi phân tích: ' + error);
      setShowBatchModal(false);
    } finally {
      setPredicting(false);
    }
  };

  const analyzeDiseaseFromImage = async (imageUri: string) => {
    try {
      setPredicting(true);
      setSelectedImage(imageUri); // Lưu ảnh để hiển thị trong loading
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
        console.log('Phân tích thành công:', result.predicted_class_vi);
        console.log(' Bounding box data:', result.leaf_bbox);
      } else {
        alert(' Không thể phân tích ảnh. Vui lòng thử lại!');
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
            <View style={styles.weatherLoadingContainer}>
              <ActivityIndicator size="large" color="#F9A825" />
              <Text style={styles.weatherLoadingText}>Đang tải thời tiết...</Text>
            </View>
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
          ) : locationGranted ? (
            <View style={styles.weatherErrorContainer}>
              <Ionicons name="cloud-offline-outline" size={50} color="#F9A825" />
              <Text style={styles.weatherErrorTitle}>Không thể tải thời tiết</Text>
              <TouchableOpacity
                style={styles.weatherRetryButton}
                onPress={fetchWeather}
              >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.weatherRetryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.weatherLeft}>
                <Ionicons name="location-outline" size={24} color="#F9A825" style={{ marginBottom: 8 }} />
                <Text style={styles.weatherTitle}>Thời tiết địa phương</Text>
                <Text style={styles.weatherSubtitle}>Cần quyền truy cập vị trí để hiển thị</Text>
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
              <View style={styles.locationIconContainer}>
                <Ionicons name="location" size={28} color="#FF9800" />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={styles.locationTitle}>Bật định vị</Text>
                <Text style={styles.locationSubtitle}>Để xem thời tiết và dự báo chính xác</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.locationButton, loading && styles.locationButtonDisabled]}
              onPress={requestLocationAndFetchWeather}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FF9800" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FF9800" />
                  <Text style={styles.locationButtonText}>Cho phép</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Disease Detection Section */}
        <View style={styles.diseaseSection}>
          <Text style={styles.sectionTitle}>Chữa cho cây trồng</Text>

          <View style={styles.processContainer}>
            <View style={styles.processStep}>
              <View style={styles.processIcon}>
                <Ionicons name="leaf" size={40} color="#4CAF50" />
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

          {/* Hướng dẫn chụp ảnh */}
          <View style={styles.guideCard}>
            <View style={styles.guideHeader}>
              <Ionicons name="information-circle" size={20} color="#2196F3" />
              <Text style={styles.guideTitle}>💡 Hướng dẫn chụp ảnh</Text>
            </View>
            <View style={styles.guideList}>
              <View style={styles.guideItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.guideText}>Chụp rõ phần lá bị bệnh</Text>
              </View>
              <View style={styles.guideItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.guideText}>Đảm bảo ánh sáng đủ, không bị mờ</Text>
              </View>
              <View style={styles.guideItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.guideText}>Lá chiếm phần lớn trong khung hình</Text>
              </View>
              <View style={styles.guideItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.guideText}>Tránh chụp quá xa hoặc góc nghiêng</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={pickImage}
            disabled={predicting}
          >
            <Ionicons name="camera" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.captureButtonText}>
              Chụp ảnh bệnh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, styles.galleryButton]}
            onPress={pickImageFromGallery}
            disabled={predicting}
          >
            <Ionicons name="images" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.captureButtonText]}>
              Chọn từ thư viện
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, styles.batchButton]}
            onPress={pickMultipleImages}
            disabled={predicting}
          >
            <Ionicons name="albums" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.captureButtonText, styles.batchButtonText]}>
              {predicting ? 'Đang phân tích...' : 'Chọn nhiều ảnh'}
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
                  <TouchableOpacity
                    onPress={() => {
                      console.log('🔍 Opening zoom modal...');
                      console.log('📦 predictionResult.leaf_bbox:', predictionResult.leaf_bbox);
                      console.log('🖼️ selectedImage:', selectedImage);
                      const zoomData = {
                        uri: selectedImage,
                        bbox: predictionResult.leaf_bbox
                      };
                      console.log('✅ Setting zoomedImage to:', zoomData);
                      setZoomedImage(zoomData);
                      setShowImageZoom(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.resultImageContainer}>
                      <Image source={{ uri: selectedImage }} style={styles.resultImage} />
                      {predictionResult.leaf_bbox && (
                        <View style={styles.bboxOverlay}>
                          <Text style={styles.bboxLabel}>🍃 Nhấn để xem vùng lá phát hiện</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
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
                      <Text style={styles.resultDiseaseName}>{predictionResult.disease_info?.name}</Text>
                    </View>
                  </View>

                  <View style={styles.confidenceBar}>
                    <Text style={styles.confidenceLabel}>Độ tin cậy:</Text>
                    <Text style={styles.confidenceValue}>{predictionResult.confidence?.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${predictionResult.confidence || 0}%` }
                      ]}
                    />
                  </View>
                </View>

                {/* Mô tả bệnh */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>📋 Mô tả</Text>
                  <Text style={styles.infoText}>{predictionResult.disease_info?.description}</Text>
                </View>

                {/* Phương pháp điều trị */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>💊 Phương pháp điều trị</Text>
                  <Text style={styles.infoText}>{predictionResult.disease_info?.treatment}</Text>
                </View>

                {/* Nút xem chi tiết điều trị - chỉ hiện nếu bệnh có trong database */}
                {predictionResult.predicted_class !== 'Healthy' && predictionResult.predicted_class_vi && getDiseaseIdByApiName(predictionResult.predicted_class_vi) && (
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => {
                      const diseaseId = predictionResult.predicted_class_vi && getDiseaseIdByApiName(predictionResult.predicted_class_vi);
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
                  {predictionResult.all_predictions && Object.entries(predictionResult.all_predictions).map(([disease, data]) => (
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

      {/* Modal phóng to ảnh với bounding box */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showImageZoom}
        onRequestClose={() => setShowImageZoom(false)}
      >
        <View style={styles.zoomOverlay}>
          <TouchableOpacity
            style={styles.zoomCloseButton}
            onPress={() => setShowImageZoom(false)}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {zoomedImage && (() => {
            console.log('🎯 In Modal - zoomedImage:', zoomedImage);
            console.log('🎯 In Modal - zoomedImage.bbox:', zoomedImage.bbox);
            console.log('🎯 In Modal - typeof bbox:', typeof zoomedImage.bbox);
            console.log('🎯 In Modal - Array.isArray(bbox):', Array.isArray(zoomedImage.bbox));

            return (
              <View style={styles.zoomImageContainer}>
                <View
                  style={{ width: '100%', height: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' }}
                  onLayout={(e) => {
                    const { width: layoutWidth, height: layoutHeight } = e.nativeEvent.layout;
                    // Tính kích thước ảnh khi contain (assume ảnh vuông 256x256)
                    const imageSize = Math.min(layoutWidth, layoutHeight);
                    setImageLayout({ width: imageSize, height: imageSize });
                  }}
                >
                  <View style={{ width: imageLayout?.width || '100%', height: imageLayout?.height || '100%', position: 'relative' }}>
                    <Image
                      source={{ uri: zoomedImage.uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />

                    {/* Vẽ bounding box trên ảnh */}
                    {zoomedImage.bbox && Array.isArray(zoomedImage.bbox) && zoomedImage.bbox.length === 4 && imageLayout && (() => {
                      const [x1, y1, x2, y2] = zoomedImage.bbox;
                      const bboxWidth = x2 - x1;
                      const bboxHeight = y2 - y1;

                      // Ảnh gốc là 256x256 (model size)
                      const originalSize = 256;
                      const scale = imageLayout.width / originalSize;

                      // Tính vị trí scaled
                      const scaledX = x1 * scale;
                      const scaledY = y1 * scale;
                      const scaledWidth = bboxWidth * scale;
                      const scaledHeight = bboxHeight * scale;

                      console.log('🎨 Drawing bbox:', {
                        original: { x1, y1, x2, y2 },
                        layout: imageLayout,
                        scale,
                        scaled: { x: scaledX, y: scaledY, width: scaledWidth, height: scaledHeight }
                      });

                      return (
                        <View
                          style={{
                            position: 'absolute',
                            left: scaledX,
                            top: scaledY,
                            width: scaledWidth,
                            height: scaledHeight,
                            borderWidth: 4,
                            borderColor: '#4CAF50',
                            backgroundColor: 'rgba(76, 175, 80, 0.15)',
                          }}
                        >
                          {/* Label góc trên */}
                          <View style={{
                            position: 'absolute',
                            top: -32,
                            left: -2,
                            backgroundColor: '#4CAF50',
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 5,
                          }}>
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>
                              🍃 Lá phát hiện
                            </Text>
                          </View>

                          {/* Corner markers */}
                          <View style={{ position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#4CAF50' }} />
                          <View style={{ position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#4CAF50' }} />
                          <View style={{ position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#4CAF50' }} />
                          <View style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#4CAF50' }} />
                        </View>
                      );
                    })()}
                  </View>
                </View>

                {/* Thông tin bbox rút gọn */}
                {zoomedImage.bbox && Array.isArray(zoomedImage.bbox) && zoomedImage.bbox.length === 4 ? (
                  <View style={styles.bboxInfo}>
                    <View style={styles.bboxInfoHeader}>
                      <Ionicons name="scan" size={20} color="#4CAF50" />
                      <Text style={styles.bboxInfoTitle}>Vùng lá: {Math.round(zoomedImage.bbox[2] - zoomedImage.bbox[0])}×{Math.round(zoomedImage.bbox[3] - zoomedImage.bbox[1])} px</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.bboxInfo}>
                    <Text style={styles.bboxInfoSubtext}>Không phát hiện vùng lá</Text>
                  </View>
                )}
              </View>
            );
          })()}

          <TouchableOpacity
            style={styles.zoomDoneButton}
            onPress={() => setShowImageZoom(false)}
          >
            <Text style={styles.zoomDoneButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Loading Modal cho ảnh đơn */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={predicting && !showBatchModal}
        onRequestClose={() => { }}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.singleLoadingContent}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.loadingImage} />
            )}
            <View style={styles.loadingIndicatorContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingTitle}>Đang phân tích bệnh...</Text>
              <Text style={styles.loadingSubtitle}>Vui lòng đợi trong giây lát</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal hiển thị kết quả batch */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBatchModal}
        onRequestClose={() => setShowBatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kết quả phân tích hàng loạt</Text>
              <TouchableOpacity onPress={() => setShowBatchModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {batchResults && (
              <ScrollView style={styles.modalBody}>
                {/* Tóm tắt với progress */}
                <View style={styles.batchSummary}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="images" size={24} color="#2196F3" />
                    <Text style={styles.summaryText}>
                      {batchResults.results.length} / {batchResults.processed + batchResults.failed + (predicting ? 1 : 0)} ảnh
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    <Text style={styles.summaryText}>Thành công: {batchResults.processed}</Text>
                  </View>
                  {batchResults.failed > 0 && (
                    <View style={styles.summaryItem}>
                      <Ionicons name="close-circle" size={24} color="#F44336" />
                      <Text style={styles.summaryText}>Thất bại: {batchResults.failed}</Text>
                    </View>
                  )}
                </View>

                {predicting && batchResults.results.length === 0 && (
                  <View style={styles.batchLoadingState}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.batchLoadingText}>Đang bắt đầu phân tích...</Text>
                  </View>
                )}

                {predicting && batchResults.results.length > 0 && (
                  <View style={styles.batchProcessingIndicator}>
                    <ActivityIndicator size="small" color="#4CAF50" />
                    <Text style={styles.batchProcessingText}>Đang phân tích ảnh tiếp theo...</Text>
                  </View>
                )}

                {/* Kết quả từng ảnh */}
                {batchResults.results.map((result, index) => (
                  <View key={index} style={styles.batchResultItem}>
                    {result.imageUri && (
                      <TouchableOpacity
                        onPress={() => {
                          console.log('🔍 Batch - Opening zoom for image', index + 1);
                          console.log('📦 Batch - result.leaf_bbox:', result.leaf_bbox);
                          setZoomedImage({
                            uri: result.imageUri!,
                            bbox: result.leaf_bbox
                          });
                          setShowImageZoom(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View>
                          <Image source={{ uri: result.imageUri }} style={styles.batchResultImage} />
                          {result.leaf_bbox && (
                            <View style={styles.batchBboxBadge}>
                              <Ionicons name="scan" size={12} color="#fff" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    )}

                    {result.success ? (
                      <View style={styles.batchResultContent}>
                        <View style={styles.batchResultHeader}>
                          <Ionicons
                            name={result.predicted_class === 'Healthy' ? 'checkmark-circle' : 'warning'}
                            size={24}
                            color={result.predicted_class === 'Healthy' ? '#4CAF50' : '#FF6B35'}
                          />
                          <Text style={styles.batchResultName}>{result.disease_info?.name}</Text>
                        </View>
                        <Text style={styles.batchResultConfidence}>
                          Độ tin cậy: {result.confidence?.toFixed(1)}%
                        </Text>

                        {result.predicted_class !== 'Healthy' && result.predicted_class_vi && getDiseaseIdByApiName(result.predicted_class_vi) && (
                          <TouchableOpacity
                            style={styles.batchDetailButton}
                            onPress={() => {
                              const diseaseId = getDiseaseIdByApiName(result.predicted_class_vi!);
                              if (diseaseId) {
                                setShowBatchModal(false);
                                router.push({ pathname: '/diseases/[id]', params: { id: diseaseId } });
                              }
                            }}
                          >
                            <Ionicons name="information-circle" size={16} color="#4CAF50" />
                            <Text style={styles.batchDetailButtonText}>Xem chi tiết</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      <View style={styles.batchResultContent}>
                        <Text style={styles.batchErrorText}>Lỗi: {result.error}</Text>
                      </View>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowBatchModal(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  weatherCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  weatherLeft: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 5,
  },
  weatherSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  weatherCity: {
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 3,
  },
  weatherLocation: {
    fontSize: 10,
    color: '#E0E0E0',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  weatherRight: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  weatherIcon: {
    width: 50,
    height: 50,
    marginTop: 5,
  },
  locationCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  locationButtonDisabled: {
    opacity: 0.6,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  guideCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  guideList: {
    gap: 10,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guideText: {
    fontSize: 14,
    color: '#E0E0E0',
    flex: 1,
    lineHeight: 20,
  },
  weatherLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  weatherLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  weatherErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  weatherErrorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  weatherRetryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  weatherRetryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  diseaseSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 16,
  },
  captureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 10,
  },
  galleryButtonText: {
    color: '#FFF',
  },
  featuresContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 30,
    paddingBottom: 80,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#FFF',
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
  resultImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
  },
  bboxOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bboxLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  zoomImageContainer: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '100%',
    height: '100%',
  },
  bboxInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bboxInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  bboxInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  bboxInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  bboxInfoSubtext: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  bboxCoordinates: {
    marginVertical: 8,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  bboxCoordText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  bboxCoordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bboxCoordLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  bboxDimensions: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  bboxDimensionText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  zoomDoneButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  zoomDoneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  batchButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: 10,
  },
  batchButtonText: {
    color: '#FFF',
  },
  batchSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  batchResultItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  batchResultImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  batchBboxBadge: {
    position: 'absolute',
    top: 5,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchResultContent: {
    flex: 1,
    justifyContent: 'center',
  },
  batchResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  batchResultName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  batchResultConfidence: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  batchDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  batchDetailButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  batchErrorText: {
    fontSize: 14,
    color: '#F44336',
    fontStyle: 'italic',
  },
  batchLoadingState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchLoadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  batchProcessingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  batchProcessingText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  singleLoadingContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0',
  },
  loadingIndicatorContainer: {
    padding: 30,
    alignItems: 'center',
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
});
