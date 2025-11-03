import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Index() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      setSelectedImage(result.assets[0].uri);
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
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CropWise</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherLeft}>
            <Text style={styles.weatherTitle}>Hôm nay, 31 Th10</Text>
            <Text style={styles.weatherSubtitle}>Quang đãng • 24°C / 20°C</Text>
          </View>
          <View style={styles.weatherRight}>
            <Text style={styles.weatherTemp}>24°C</Text>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/869/869869.png' }}
              style={styles.weatherIcon}
            />
          </View>
        </View>

        {/* Location Permission Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationContent}>
            <Ionicons name="location" size={24} color="#666" />
            <Text style={styles.locationText}>Yêu cầu cho phép định vị</Text>
          </View>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationButtonText}>Cho phép</Text>
          </TouchableOpacity>
        </View>

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

          <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
            <Text style={styles.captureButtonText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="calculator" size={28} color="#333" />
            </View>
            <Text style={styles.featureText}>Tính toán phân bón</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="bug" size={28} color="#333" />
            </View>
            <Text style={styles.featureText}>Sâu hại và Bệnh cây trồng</Text>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Ionicons name="leaf" size={24} color="#fff" />
          </View>
          <Text style={styles.navTextActive}>Cây trồng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.navText}>Cộng đồng</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Tôi</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={pickImage}>
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>
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
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  featuresContainer: {
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 100,
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  navText: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
  },
  navTextActive: {
    fontSize: 11,
    color: '#000',
    marginTop: 5,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 90,
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
});
