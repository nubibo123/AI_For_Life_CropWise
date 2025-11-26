/**
 * Service để upload ảnh lên Cloudinary
 */

// Thông tin Cloudinary của bạn
const CLOUDINARY_CLOUD_NAME = 'drggczuln';
const CLOUDINARY_UPLOAD_PRESET = 'CropWise'; // Tạo unsigned upload preset trong Cloudinary Console
const CLOUDINARY_API_KEY = '99AVcs4sF7RP7GqZUpW96m4P45M';

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload ảnh lên Cloudinary
 * @param imageUri - URI của ảnh từ ImagePicker hoặc Camera
 * @param folder - Folder trong Cloudinary (optional)
 * @returns URL của ảnh đã upload
 */
export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'cropwise/community'
): Promise<CloudinaryUploadResult> => {
  try {
    console.log('📤 Bắt đầu upload ảnh lên Cloudinary...');
    console.log('📷 Image URI:', imageUri);

    // Tạo FormData
    const formData = new FormData();
    
    // Lấy tên file và type từ URI
    const uriParts = imageUri.split('/');
    const filename = uriParts[uriParts.length - 1];
    
    let type = 'image/jpeg';
    if (filename.endsWith('.png')) type = 'image/png';
    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) type = 'image/jpeg';

    // Append file
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    // Chỉ dùng upload_preset cho unsigned upload
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    console.log('🌐 Upload URL:', uploadUrl);
    console.log('📁 Folder:', folder);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary upload failed:', errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Upload thành công!');
    console.log('🔗 URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('❌ Lỗi upload ảnh lên Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Upload nhiều ảnh lên Cloudinary
 * @param imageUris - Mảng các URI ảnh
 * @param folder - Folder trong Cloudinary
 * @returns Mảng URL của các ảnh đã upload
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  folder: string = 'cropwise/community'
): Promise<string[]> => {
  try {
    console.log(`📤 Đang upload ${imageUris.length} ảnh...`);
    
    const uploadPromises = imageUris.map(uri => uploadImageToCloudinary(uri, folder));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results
      .filter(result => result.success && result.url)
      .map(result => result.url!);
    
    console.log(`✅ Upload thành công ${successfulUploads.length}/${imageUris.length} ảnh`);
    
    return successfulUploads;
  } catch (error) {
    console.error('❌ Lỗi upload nhiều ảnh:', error);
    return [];
  }
};

/**
 * Xóa ảnh từ Cloudinary (nếu cần)
 * @param publicId - Public ID của ảnh trên Cloudinary
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    // Note: Để xóa ảnh cần API secret, không nên expose trên client
    // Nên tạo Cloud Function hoặc backend API để xử lý việc xóa
    console.warn('⚠️ Delete image should be handled by backend for security');
    return false;
  } catch (error) {
    console.error('❌ Lỗi xóa ảnh:', error);
    return false;
  }
};
