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
  pricePerBag: number;
  bagWeight: number;
  image: string;
  n: number;
  p: number;
  k: number;
}

export default function FertilizerRecommendation() {
  const [selectedDisease, setSelectedDisease] = useState('');
  const [severity, setSeverity] = useState('');
  const [area, setArea] = useState('');
  const [result, setResult] = useState<any>(null);

  const fertilizers: Fertilizer[] = [
    {
      id: '1',
      name: 'Phân NPK Đầu trâu',
      pricePerBag: 1500000,
      bagWeight: 50,
      image: 'https://binhdien.com/images/npk-dau-trau/201.jpg',
      n: 20, p: 20, k: 15,
    },
    {
      id: '2',
      name: 'Phân Sông Gianh',
      pricePerBag: 200000,
      bagWeight: 50,
      image: 'https://songgianh.com.vn/upload/attachment/9556hcvs.jpg',
      n: 12, p: 7, k: 19,
    },
    {
      id: '3',
      name: 'Phân URE',
      pricePerBag: 650000,
      bagWeight: 50,
      image: 'https://vn-test-11.slatic.net/p/b9faadb4a7a057e030582a5e6375b19c.jpg',
      n: 46, p: 0, k: 0,
    },
    {
      id: '4',
      name: 'Phân Philippine',
      pricePerBag: 950000,
      bagWeight: 50,
      image: 'https://phanbonhiepphat.com/wp-content/uploads/2021/09/16168-PHILIPPINE_3D.jpg',
      n: 16, p: 16, k: 8,
    },
    {
      id: '5',
      name: 'Phân Mặt Trời',
      pricePerBag: 200000,
      bagWeight: 50,
      image: 'https://img.vietlao.vn/crop/450x450/87bd0747a2246f1e1e5854f8b09573f8.png',
      n: 20, p: 20, k: 15,
    },
    {
      id: '6',
      name: 'Phân Kali Cà Mau',
      pricePerBag: 1000000,
      bagWeight: 50,
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvlWrk8Mi9vtyDhw56XWA_QY90ovOj-b43SA&s',
      n: 0, p: 0, k: 61,
    },
    {
      id: '7',
      name: 'Phân NPK Hà Lan',
      pricePerBag: 1000000,
      bagWeight: 50,
      image: 'https://halan.net/wp-content/uploads/2022/03/BHL061-1.png',
      n: 20, p: 20, k: 15,
    },
    {
      id: '8',
      name: 'Phân Con cò',
      pricePerBag: 1000000,
      bagWeight: 50,
      image: 'https://bizweb.dktcdn.net/thumb/grande/100/484/771/products/1561367537-16-16-8.webp?v=1705474758190',
      n: 12, p: 16, k: 8,
    },
    {
      id: '9',
      name: 'Phân Lân',
      pricePerBag: 1000000,
      bagWeight: 50,
      image: 'https://cf.shopee.vn/file/afad32478eabcc02f85ee57b4589c422_tn',
      n: 0, p: 20, k: 0,
    },
  ];

  const requirementTable = {
    N: { low: 30, medium: 60, high: 90 },
    P: { low: 15, medium: 30, high: 45 },
    K: { low: 20, medium: 40, high: 60 },
  };

  const getSeverityLevel = (percent: number) => {
    if (percent <= 33) return "low";
    if (percent <= 66) return "medium";
    return "high";
  };

  const handleCalculate = () => {
    if (!selectedDisease || !area || !severity) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const sevLevel = getSeverityLevel(Number(severity));

    let neededN = 0, neededP = 0, neededK = 0;

    if (selectedDisease === "yellow_leaf") neededN = requirementTable.N[sevLevel];
    if (selectedDisease === "purple_leaf") neededP = requirementTable.P[sevLevel];
    if (selectedDisease === "burnt_edge") neededK = requirementTable.K[sevLevel];

    // 1. Tổng NPK nguyên chất cần bón
    const totalN = (neededN * Number(area)) / 1000;
    const totalP = (neededP * Number(area)) / 1000;
    const totalK = (neededK * Number(area)) / 1000;

    // 2. Chọn phân phù hợp nhất
    let bestFertilizer = null;

if (selectedDisease === "yellow_leaf") {
  // chỉ so N
  bestFertilizer = fertilizers.reduce((best, curr) => {
    const diffBest = Math.abs(best.n - neededN);
    const diffCurr = Math.abs(curr.n - neededN);
    return diffCurr < diffBest ? curr : best;
  });
}

if (selectedDisease === "purple_leaf") {
  // chỉ so P
  bestFertilizer = fertilizers.reduce((best, curr) => {
    const diffBest = Math.abs(best.p - neededP);
    const diffCurr = Math.abs(curr.p - neededP);
    return diffCurr < diffBest ? curr : best;
  });
}

if (selectedDisease === "burnt_edge") {
  // chỉ so K
  bestFertilizer = fertilizers.reduce((best, curr) => {
    const diffBest = Math.abs(best.k - neededK);
    const diffCurr = Math.abs(curr.k - neededK);
    return diffCurr < diffBest ? curr : best;
  });
}

    // 3. Tính số kg phân cần thiết
    const calcKg = (need: number, percent: number) =>
      percent > 0 ? need / (percent / 100) : 0;

    const kgN = totalN > 0 ? calcKg(totalN, bestFertilizer.n) : 0;
    const kgP = totalP > 0 ? calcKg(totalP, bestFertilizer.p) : 0;
    const kgK = totalK > 0 ? calcKg(totalK, bestFertilizer.k) : 0;

    const fertilizerKg = Math.max(kgN, kgP, kgK);

    // 4. Tính tiền theo kg
    const pricePerKg = bestFertilizer.pricePerBag / bestFertilizer.bagWeight;
    const totalCost = fertilizerKg * pricePerKg;

    setResult({
      npk: { n: totalN, p: totalP, k: totalK },
      recommended: bestFertilizer,
      weightKg: fertilizerKg,
      cost: totalCost,
      similar: fertilizers,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gợi ý phân bón</Text>
      </View>

      <Text style={styles.label}>Chọn loại bệnh:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDisease}
          onValueChange={(v) => setSelectedDisease(v)}
        >
          <Picker.Item label="Chọn bệnh" value="" />
          <Picker.Item label="Lá vàng (thiếu N)" value="yellow_leaf" />
          <Picker.Item label="Lá tím (thiếu P)" value="purple_leaf" />
          <Picker.Item label="Cháy mép lá (thiếu K)" value="burnt_edge" />
        </Picker>
      </View>

      <Text style={styles.label}>Mức độ bệnh (%):</Text>
      <TextInput
        style={styles.input}
        value={severity}
        onChangeText={setSeverity}
        keyboardType="numeric"
        placeholder="Nhập mức độ bệnh (0–100%)"
      />

      <Text style={styles.label}>Diện tích (m²):</Text>
      <TextInput
        style={styles.input}
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
        placeholder="Nhập diện tích"
      />

      <TouchableOpacity style={styles.button} onPress={handleCalculate}>
        <Text style={styles.buttonText}>Tính toán</Text>
      </TouchableOpacity>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Tổng NPK cần bổ sung</Text>
          <View style={styles.npkContainer}>
            <Text>N: {result.npk.n.toFixed(1)} kg</Text>
            <Text>P: {result.npk.p.toFixed(1)} kg</Text>
            <Text>K: {result.npk.k.toFixed(1)} kg</Text>
          </View>

          <Text style={styles.resultTitle}>Phân bón đề xuất</Text>
          <View style={styles.fertilizerCard}>
            <Image
              source={{ uri: result.recommended.image }}
              style={styles.fertilizerImage}
            />
            <View style={styles.fertilizerInfo}>
              <Text style={styles.fertilizerName}>{result.recommended.name}</Text>
              <Text>Giá/kg: {(result.recommended.pricePerBag / result.recommended.bagWeight).toLocaleString()} đ</Text>
              <Text>Số kg cần mua: {result.weightKg.toFixed(1)} kg</Text>
              <Text>Tổng chi phí: {result.cost.toLocaleString()} đ</Text>
            </View>
          </View>

          <Text style={styles.resultTitle}>Các loại phân tương tự</Text>
          {result.similar.map((item: Fertilizer) => (
            <View key={item.id} style={styles.fertilizerCard}>
              <Image source={{ uri: item.image }} style={styles.fertilizerImage} />
              <View style={styles.fertilizerInfo}>
                <Text style={styles.fertilizerName}>{item.name}</Text>
                <Text>N:{item.n}%, P:{item.p}%, K:{item.k}%</Text>
                <Text>Giá mỗi bao: {item.pricePerBag.toLocaleString()} đ</Text>
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
  npkContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  fertilizerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowOpacity: 0.1,
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
});
