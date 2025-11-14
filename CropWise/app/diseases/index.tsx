import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { maizeDiseases, searchDiseases } from '../../services/maizeDiseases';

export default function MaizeDiseasesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiseases = searchQuery.trim() 
    ? searchDiseases(searchQuery) 
    : maizeDiseases;

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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bệnh Cây Ngô</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bệnh..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Disease List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          {searchQuery ? `Tìm thấy ${filteredDiseases.length} kết quả` : 'Tất cả các bệnh'}
        </Text>

        {filteredDiseases.map((disease) => (
          <TouchableOpacity
            key={disease.id}
            style={styles.diseaseCard}
            onPress={() => router.push({ pathname: '/diseases/[id]', params: { id: disease.id } })}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: disease.image }}
              style={styles.diseaseImage}
              resizeMode="cover"
            />
            <View style={styles.diseaseInfo}>
              <View style={styles.diseaseHeader}>
                <Text style={styles.diseaseName}>{disease.name}</Text>
                <View 
                  style={[
                    styles.severityBadge, 
                    { backgroundColor: getSeverityColor(disease.severity) }
                  ]}
                >
                  <Text style={styles.severityText}>
                    {getSeverityText(disease.severity)}
                  </Text>
                </View>
              </View>
              <Text style={styles.diseaseNameEn}>{disease.nameEn}</Text>
              <Text style={styles.diseaseDescription} numberOfLines={2}>
                {disease.description}
              </Text>
              <View style={styles.diseaseFooter}>
                <View style={styles.infoItem}>
                  <Ionicons name="alert-circle-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {disease.symptoms.length} triệu chứng
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="medical-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>
                    {disease.treatment.length} cách điều trị
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        ))}

        {filteredDiseases.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptySubtext}>
              Thử tìm kiếm với từ khóa khác
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  diseaseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diseaseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  diseaseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  diseaseNameEn: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  diseaseDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  diseaseFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
