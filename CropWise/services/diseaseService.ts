// Service để gọi API phân loại bệnh cây ngô

// THAY ĐỔI URL NÀY SAU KHI DEPLOY LÊN RENDER
//const API_URL = 'https://nubibo-cropwise-api.hf.space'; // Thay bằng URL từ Render

// ---- LOCAL DEVELOPMENT (comment lại khi đã deploy) ----
// const API_URL = 'http://192.168.0.106:8001'; // Cho Expo Go trên điện thoại/emulator
// const API_URL = 'http://10.0.2.2:8001'; // Cho Android emulator (không dùng Expo Go)
// const API_URL = 'http://localhost:8001'; // Cho web

const API_URL = 'https://indexless-lilyana-subprofessionally.ngrok-free.dev';
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
  predicted_class: string;
  predicted_class_vi: string;
  confidence: number;
  disease_info: DiseaseInfo;
  all_predictions: {
    [key: string]: PredictionDetail;
  };
  error?: string;
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

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed with status: ${apiResponse.status}`);
    }

    const result: PredictionResult = await apiResponse.json();
    console.log('✅ Prediction result:', result);

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
    const response = await fetch(`${API_URL}/`);
    const data = await response.json();
    console.log('✅ API Status:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ API không khả dụng:', error);
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
  error?: string;
  imageUri?: string; // Thêm để hiển thị ảnh gốc
}

export interface BatchResponse {
  success: boolean;
  processed: number;
  failed: number;
  results: BatchPredictionResult[];
  error?: string;
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
      },
    });

    console.log('📥 Response status:', apiResponse.status);
    console.log('📥 Response ok:', apiResponse.ok);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API request failed with status: ${apiResponse.status}`);
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
