// ---- LOCAL DEVELOPMENT (comment lại khi đã deploy) ----
// const API_URL = 'http://192.168.0.106:8001'; // Cho Expo Go trên điện thoại/emulator
// const API_URL = 'http://10.0.2.2:8001'; // Cho Android emulator (không dùng Expo Go)
// const API_URL = 'http://localhost:8001'; // Cho web

const API_URL = 'https://5b3d-34-87-119-80.ngrok-free.app';
export interface DiseaseInfo {
  name: string;
  description: string;
  treatment: string;
}

export interface PredictionDetail {
  probability: number;
  label_en: string;
}

export interface PredictionResult {
  success: boolean;
  predicted_class?: string;
  predicted_class_vi?: string;
  confidence?: number;
  disease_info?: DiseaseInfo;
  all_predictions?: {
    [key: string]: PredictionDetail;
  };
  leaf_detection_confidence?: number; // Confidence của YOLO khi phát hiện lá
  leaf_bbox?: number[]; // Tọa độ bounding box [x1, y1, x2, y2]
  model_info?: {
    step1?: string; // "YOLO (phát hiện lá - chọn bbox lớn nhất)"
    step2?: string; // "DenseNet121 (phân loại bệnh)"
    detection?: string; // Backward compatibility
    classification?: string; // Backward compatibility
  };
  error?: string;
  error_code?: string; // NO_LEAF_DETECTED, LEAF_TOO_SMALL, PREDICTION_ERROR, SERVER_ERROR
  suggestion?: string; // Gợi ý khi có lỗi
  details?: string; // Chi tiết lỗi
}

export const predictDisease = async (imageUri: string): Promise<PredictionResult | null> => {
  try {
    console.log('🔄 Đang gửi ảnh đến API...');
    console.log('📷 URI:', imageUri);
    console.log('🌐 API URL:', `${API_URL}/predict`);

    // Tạo FormData để upload ảnh
    const formData = new FormData();

    // Lấy tên file từ URI
    const uriParts = imageUri.split('/');
    const filename = uriParts[uriParts.length - 1];

    // Xác định type từ extension
    let type = 'image/jpeg';
    if (filename.endsWith('.png')) type = 'image/png';
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) type = 'image/jpeg';

    // Append file với format React Native yêu cầu
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    console.log('� Uploading file:', filename, 'Type:', type);
    console.log('📤 Full API URL:', `${API_URL}/predict`);

    const apiResponse = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    console.log('📥 Response status:', apiResponse.status);
    console.log('📥 Response ok:', apiResponse.ok);
    console.log('📥 Content-Type:', apiResponse.headers.get('content-type'));

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    // Kiểm tra content-type trước khi parse JSON
    const contentType = apiResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await apiResponse.text();
      console.error('❌ API trả về không phải JSON:');
      console.error('Content-Type:', contentType);
      console.error('Response preview:', text.substring(0, 300));
      throw new Error('API trả về HTML thay vì JSON. Kiểm tra ngrok URL hoặc server status!');
    }

    const result: PredictionResult = await apiResponse.json();
    console.log('✅ Prediction result:', result);

    // Xử lý các error codes từ API
    if (!result.success) {
      console.warn('⚠️ Prediction không thành công:', result.error_code);

      if (result.error_code === 'NO_LEAF_DETECTED') {
        console.warn('🍃 Không phát hiện lá nào trong ảnh');
        console.warn('💡 Gợi ý:', result.suggestion);
      } else if (result.error_code === 'LEAF_TOO_SMALL') {
        console.warn('📏 Vùng lá phát hiện quá nhỏ');
        console.warn('💡 Gợi ý:', result.suggestion);
      } else if (result.error_code === 'PREDICTION_ERROR') {
        console.error('❌ Lỗi khi dự đoán bệnh');
      }
    } else {
      console.log('✅ Quy trình 2 bước hoàn tất:');
      console.log('   1️⃣ YOLO detect lá →', result.model_info?.step1 || result.model_info?.detection || 'Detected');
      console.log('   2️⃣ DenseNet classify →', result.model_info?.step2 || result.model_info?.classification || 'Classified');
      console.log('🍃 Leaf detection confidence:', result.leaf_detection_confidence);
      if (result.leaf_bbox) {
        const [x1, y1, x2, y2] = result.leaf_bbox;
        console.log('📦 Leaf bounding box:', `(${x1}, ${y1}) → (${x2}, ${y2})`);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Error predicting disease:', error);
    console.error('❌ Error name:', (error as Error).name);
    console.error('❌ Error message:', (error as Error).message);
    if ((error as any).stack) {
      console.error('❌ Stack trace:', (error as any).stack);
    }
    return null;
  }
};

export const checkAPIStatus = async (): Promise<boolean> => {
  try {
    console.log('🔍 Đang kiểm tra API status tại:', `${API_URL}/`);

    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Bỏ qua ngrok warning page
      },
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    console.log('📥 Content-Type:', response.headers.get('content-type'));

    // Kiểm tra content-type trước khi parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ API trả về không phải JSON:');
      console.error('Content-Type:', contentType);
      console.error('Response preview:', text.substring(0, 200));

      // Kiểm tra nếu là ngrok warning page
      if (text.includes('ngrok') || text.includes('Tunnel') || text.includes('<!DOCTYPE')) {
        console.error('⚠️ Có vẻ đây là ngrok warning page!');
        console.error('💡 Giải pháp:');
        console.error('   1. Thêm header "ngrok-skip-browser-warning: true"');
        console.error('   2. Hoặc truy cập URL trong browser 1 lần để verify');
      }

      return false;
    }

    const data = await response.json();
    console.log('✅ API Status:', data);
    console.log('✅ API version:', data.version);
    console.log('✅ Models:', data.models);

    return response.ok;
  } catch (error) {
    console.error('❌ API không khả dụng:', error);
    console.error('❌ API URL:', API_URL);
    console.error('💡 Kiểm tra:');
    console.error('   1. Server đã chạy chưa?');
    console.error('   2. URL ngrok đúng chưa?');
    console.error('   3. Ngrok session còn active không?');

    if (error instanceof SyntaxError) {
      console.error('⚠️ Lỗi parse JSON - API có thể trả về HTML thay vì JSON');
    }

    return false;
  }
};

export interface BatchPredictionResult {
  filename: string;
  success: boolean;
  predicted_class?: string;
  predicted_class_vi?: string;
  confidence?: number;
  disease_info?: DiseaseInfo;
  all_predictions?: {
    [key: string]: PredictionDetail;
  };
  leaf_detection_confidence?: number; // Confidence của YOLO
  leaf_bbox?: number[]; // Tọa độ bounding box [x1, y1, x2, y2]
  model_info?: {
    step1?: string;
    step2?: string;
    detection?: string;
    classification?: string;
  };
  error?: string;
  error_code?: string; // NO_LEAF_DETECTED, LEAF_TOO_SMALL, etc.
  suggestion?: string;
  imageUri?: string; // Để hiển thị ảnh gốc
}

export interface BatchResponse {
  success: boolean;
  processed: number;
  failed: number;
  no_leaf_detected?: number; // Số ảnh không phát hiện lá
  leaf_too_small?: number; // Số ảnh có vùng lá quá nhỏ
  total: number;
  results: BatchPredictionResult[];
  model?: string; // "YOLOv8m-seg + DenseNet121"
  error?: string;
  error_code?: string;
}

export const predictDiseasesBatch = async (imageUris: string[]): Promise<BatchResponse | null> => {
  try {
    console.log('🔄 Đang gửi nhiều ảnh đến API...');
    console.log('📷 Số lượng ảnh:', imageUris.length);
    console.log('🌐 API URL:', `${API_URL}/predict-batch`);

    const formData = new FormData();

    // Thêm tất cả ảnh vào FormData
    for (let i = 0; i < imageUris.length; i++) {
      const imageUri = imageUris[i];
      const uriParts = imageUri.split('/');
      const filename = uriParts[uriParts.length - 1] || `image_${i}.jpg`;

      let type = 'image/jpeg';
      if (filename.endsWith('.png')) type = 'image/png';
      else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) type = 'image/jpeg';

      formData.append('files', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);
    }

    console.log('📤 Uploading', imageUris.length, 'images...');

    const apiResponse = await fetch(`${API_URL}/predict-batch`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Thêm header cho batch endpoint
      },
    });

    console.log('📥 Response status:', apiResponse.status);
    console.log('📥 Response ok:', apiResponse.ok);
    console.log('📥 Content-Type:', apiResponse.headers.get('content-type'));

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    // Kiểm tra content-type
    const contentType = apiResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await apiResponse.text();
      console.error('❌ Batch API trả về không phải JSON');
      console.error('Response preview:', text.substring(0, 300));
      throw new Error('API trả về HTML thay vì JSON!');
    }

    const result: BatchResponse = await apiResponse.json();

    // Thêm imageUri vào mỗi result để hiển thị
    result.results = result.results.map((r, idx) => ({
      ...r,
      imageUri: imageUris[idx]
    }));

    console.log('✅ Batch prediction result:', result);

    return result;
  } catch (error) {
    console.error('❌ Error predicting diseases batch:', error);
    console.error('❌ Error name:', (error as Error).name);
    console.error('❌ Error message:', (error as Error).message);
    if ((error as any).stack) {
      console.error('❌ Stack trace:', (error as any).stack);
    }
    return null;
  }
};
