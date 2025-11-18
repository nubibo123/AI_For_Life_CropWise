import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Fertilizer {
  id: string;
  name: string;
  price: string;
  image: string;
  n: number;
  p: number;
  k: number;
}

export default function FertilizerRecommendation() {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [area, setArea] = useState('');
  const [result, setResult] = useState<any>(null);

  // Ví dụ dữ liệu
  const fertilizers: Fertilizer[] = [
    {
      id: '1',
      name: 'Phân Ure',
      price: '150.000đ',
      image: 'https://vntradimex.com/public/files/product/phan-dam-urea-cao-cap-61e57d5cec5d5.jpg',
      n: 46,
      p: 0,
      k: 0,
    },
    {
      id: '2',
      name: 'Phân NPK 20-20-15',
      price: '200.000đ',
      image: 'https://www.binhnhi.com/wp-content/uploads/2016/09/08280fac6c44c461633c24eb99c448d1.jpg',
      n: 20,
      p: 20,
      k: 15,
    },
  ];

  const handleCalculate = () => {
    // Giả lập kết quả dựa trên disease + area
    setResult({
      npk: { n: 50, p: 20, k: 30 },
      recommended: fertilizers[0],
      similar: fertilizers,
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gợi ý phân bón</Text>
      </View>

      {/* Chọn bệnh */}
      <Text style={styles.label}>Chọn bệnh:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDisease}
          onValueChange={(itemValue = String) => setSelectedDisease(itemValue)}
        >
          <Picker.Item label="Chọn bệnh" value="" />
          <Picker.Item label="Bệnh lá vàng" value="yellow_leaf" />
          <Picker.Item label="Bệnh thối rễ" value="root_rot" />
        </Picker>
      </View>

      {/* Nhập diện tích */}
      <Text style={styles.label}>Diện tích (ha):</Text>
      <TextInput
        style={styles.input}
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
        placeholder="Nhập diện tích"
      />

      {/* Nút tính */}
      <TouchableOpacity style={styles.button} onPress={handleCalculate}>
        <Text style={styles.buttonText}>Tính toán</Text>
      </TouchableOpacity>

      {/* Kết quả */}
      {result && (
        <View style={styles.resultContainer}>
          {/* NPK */}
          <Text style={styles.resultTitle}>Hàm lượng dinh dưỡng</Text>
          <View style={styles.npkContainer}>
            <View style={styles.npkRow}>
              <Text style={styles.npkLabel}>Nitơ (N):</Text>
              <Text style={styles.npkValue}>{result.npk.n}%</Text>
            </View>
            <View style={styles.npkRow}>
              <Text style={styles.npkLabel}>Photpho (P):</Text>
              <Text style={styles.npkValue}>{result.npk.p}%</Text>
            </View>
            <View style={styles.npkRow}>
              <Text style={styles.npkLabel}>Kali (K):</Text>
              <Text style={styles.npkValue}>{result.npk.k}%</Text>
            </View>
          </View>

          {/* Phân đề xuất */}
          <Text style={styles.resultTitle}>Phân bón đề xuất</Text>
          <View style={styles.fertilizerCard}>
            <Image
              source={{ uri: result.recommended.image }}
              style={styles.fertilizerImage}
            />
            <View style={styles.fertilizerInfo}>
              <Text style={styles.fertilizerName}>{result.recommended.name}</Text>
              <Text style={styles.fertilizerPrice}>{result.recommended.price}</Text>
            </View>
          </View>

          {/* Phân tương tự */}
          <Text style={styles.resultTitle}>Các loại phân tương tự</Text>
          {result.similar.map((item: Fertilizer) => (
            <View key={item.id} style={styles.fertilizerCard}>
              <Image source={{ uri: item.image }} style={styles.fertilizerImage} />
              <View style={styles.fertilizerInfo}>
                <Text style={styles.fertilizerName}>{item.name}</Text>
                <Text style={styles.fertilizerPrice}>{item.price}</Text>
                <Text style={styles.npkValue}>
                  N:{item.n}%, P:{item.p}%, K:{item.k}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#F1F8E9',
    padding: 16,
    borderRadius: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2C5F2D',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  // NPK
  npkContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  npkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  npkLabel: {
    fontWeight: '600',
    color: '#2C5F2D',
  },
  npkValue: {
    color: '#1B5E20',
  },
  // Fertilizer card
  fertilizerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fertilizerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  fertilizerInfo: {
    flex: 1,
  },
  fertilizerName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#2C5F2D',
  },
  fertilizerPrice: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
