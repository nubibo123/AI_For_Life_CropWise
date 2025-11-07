import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createPost } from '../../services/communityService';

export default function CreatePostScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCropType, setSelectedCropType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const MAX_TITLE_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 2500;

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSelectCropType = () => {
    // TODO: Implement crop type picker modal
    Alert.alert('Chọn cây trồng', 'Tính năng đang phát triển');
  };

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập câu hỏi hoặc mô tả');
      return;
    }

    try {
      setLoading(true);
      const postData = {
        title: title.trim() || undefined,
        content: content.trim() || description.trim(),
        description: description.trim() || undefined,
        imageUrl: selectedImage || undefined,
        cropType: selectedCropType || undefined,
      };

      const newPost = await createPost(postData);
      
      if (newPost) {
        Alert.alert('Thành công', 'Bài đăng đã được tạo', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              // Refresh community feed
              router.replace('/(tabs)/community');
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', 'Không thể tạo bài đăng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỏi Cộng đồng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Thêm hình ảnh */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handlePickImage}
          activeOpacity={0.7}
        >
          <Ionicons name="image-outline" size={24} color="#666" />
          <Text style={styles.addButtonText}>Thêm hình ảnh</Text>
        </TouchableOpacity>
        <Text style={styles.hintText}>
          Cải thiện xác suất nhận được câu trả lời đúng
        </Text>

        {/* Preview ảnh đã chọn */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={handleRemoveImage}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Thêm cây trồng */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleSelectCropType}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>Thêm cây trồng</Text>
        </TouchableOpacity>

        {/* Câu hỏi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Câu hỏi của bạn cho cộng đồng
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Thêm một câu hỏi cho biết vấn đề với cây trồng của bạn"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
            multiline
            maxLength={MAX_TITLE_LENGTH}
          />
          <Text style={styles.characterCount}>
            {title.length} / {MAX_TITLE_LENGTH} số ký tự
          </Text>
        </View>

        {/* Mô tả */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả vấn đề của bạn</Text>
          <TextInput
            style={[styles.textArea, styles.descriptionArea]}
            placeholder="Mô tả các đặc trưng như thay đổi ở lá, màu rễ, bọ, chỗ rách..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <Text style={styles.characterCount}>
            {description.length} / {MAX_DESCRIPTION_LENGTH} số ký tự
          </Text>
        </View>
      </ScrollView>

      {/* Nút Gửi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() && !description.trim() && !content.trim() || loading) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={(!title.trim() && !description.trim() && !content.trim()) || loading}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Đang gửi...' : 'Gửi'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    color: '#333',
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    marginLeft: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  descriptionArea: {
    minHeight: 150,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

