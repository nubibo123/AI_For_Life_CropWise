import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getDiseaseById } from '../../services/maizeDiseases';

export default function DiseaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'treatment' | 'prevention'>('treatment');
  
  const disease = getDiseaseById(id as string);

  if (!disease) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin bệnh</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Nguy hiểm cao';
      case 'medium': return 'Nguy hiểm trung bình';
      case 'low': return 'Nguy hiểm thấp';
      default: return '';
    }
  };

  const speakDiseaseInfo = async () => {
    try {
      if (isSpeaking) {
        // Dừng đọc
        Speech.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);

      // Tạo nội dung đọc
      const content = `
        ${disease.name}. ${disease.nameEn}.
        
        Mô tả: ${disease.description}
        
        Triệu chứng:
        ${disease.symptoms.map((symptom, index) => `${index + 1}. ${symptom}`).join('. ')}
        
        Nguyên nhân gây bệnh:
        ${disease.causes.map((cause, index) => `${index + 1}. ${cause}`).join('. ')}
        
        Cách điều trị và ngăn chặn:
        ${disease.treatment.map((treatment, index) => `${index + 1}. ${treatment}`).join('. ')}
        
        Biện pháp phòng ngừa:
        ${disease.prevention.map((prevention, index) => `${index + 1}. ${prevention}`).join('. ')}
      `;

      // Đọc nội dung bằng giọng tiếng Việt
      Speech.speak(content, {
        language: 'vi-VN',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => {
          setIsSpeaking(false);
          Alert.alert('Lỗi', 'Không thể đọc nội dung. Vui lòng thử lại.');
        }
      });
    } catch (error) {
      setIsSpeaking(false);
      Alert.alert('Lỗi', 'Không thể sử dụng tính năng đọc giọng nói.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header with Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: disease.image }}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerSpeakButton}
          onPress={speakDiseaseInfo}
        >
          <Ionicons 
            name={isSpeaking ? "pause-circle" : "volume-high"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.speakButtonText}>Nghe</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{disease.name}</Text>
          <Text style={styles.headerSubtitle}>{disease.nameEn}</Text>
          <View 
            style={[
              styles.severityBadge, 
              { backgroundColor: getSeverityColor(disease.severity) }
            ]}
          >
            <Ionicons name="alert-circle" size={16} color="#fff" />
            <Text style={styles.severityText}>
              {getSeverityText(disease.severity)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#1976D2" />
            <Text style={styles.sectionTitle}>Mô tả</Text>
          </View>
          <Text style={styles.description}>{disease.description}</Text>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={styles.sectionTitle}>Triệu chứng</Text>
          </View>
          {disease.symptoms.map((symptom, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{symptom}</Text>
            </View>
          ))}
        </View>

        {/* Causes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flask" size={24} color="#9C27B0" />
            <Text style={styles.sectionTitle}>Nguyên nhân gây bệnh</Text>
          </View>
          {disease.causes.map((cause, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.bullet} />
              <Text style={styles.listText}>{cause}</Text>
            </View>
          ))}
        </View>

        {/* Treatment and Prevention - Tabs */}
        <View style={styles.section}>
          {/* Tab Headers */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'treatment' && styles.activeTab
              ]}
              onPress={() => setActiveTab('treatment')}
            >
              <Ionicons 
                name="medical" 
                size={20} 
                color={activeTab === 'treatment' ? '#4CAF50' : '#999'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'treatment' && styles.activeTabText
              ]}>
                Điều trị
              </Text>
            </TouchableOpacity>

            <View style={styles.tabDivider} />

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'prevention' && styles.activeTab
              ]}
              onPress={() => setActiveTab('prevention')}
            >
              <Ionicons 
                name="shield-checkmark" 
                size={20} 
                color={activeTab === 'prevention' ? '#FF9800' : '#999'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === 'prevention' && styles.activeTabText
              ]}>
                Ngăn chặn
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'treatment' ? (
              <>
                {disease.treatment.map((treatment, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: '#4CAF50' }]} />
                    <Text style={styles.listText}>{treatment}</Text>
                  </View>
                ))}
              </>
            ) : (
              <>
                {disease.prevention.map((prevention, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: '#FF9800' }]} />
                    <Text style={styles.listText}>{prevention}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerBackButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpeakButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  speakButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1976D2',
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  listText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  tabDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  tabContent: {
    paddingTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
