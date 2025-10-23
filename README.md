# AI_For_Life_CropWise

Hướng dẫn nhanh để clone, cài đặt và chạy project React Native / Expo này.

## Yêu cầu trước
- Node.js (khuyến nghị LTS)
- npm hoặc yarn
- Expo CLI (nếu dự án dùng Expo) — tùy chọn: `npm install -g expo-cli`

## Clone repository

Mở terminal và chạy:

```powershell
git clone https://github.com/nubibo123/AI_For_Life_CropWise.git
cd AI_For_Life_CropWise
```

Nếu bạn dùng SSH thay vì HTTPS:

```powershell
git clone git@github.com:nubibo123/AI_For_Life_CropWise.git
cd AI_For_Life_CropWise
```

## Cài phụ thuộc

Sử dụng npm:

```powershell
npm install
```

Hoặc yarn:

```powershell
yarn install
```

## Chạy ứng dụng (development)

Nếu dự án là Expo (thường có `app.json` và cấu trúc tương tự):

```powershell
npm start
# hoặc
yarn start
```

Sau đó mở trên thiết bị thật bằng Expo Go hoặc trên simulator/emulator.

Nếu dự án không dùng Expo, kiểm tra `package.json` để biết lệnh chạy (ví dụ `npm run ios` hoặc `npm run android`).

## Lưu ý
- Nếu gặp vấn đề về đường dẫn (OneDrive hoặc dấu cách trong đường dẫn trên Windows), thử di chuyển repository vào thư mục không chứa dấu cách.
- Kiểm tra `package.json` để biết script cụ thể và các lệnh dev khác.

## Liên hệ
Nếu cần trợ giúp thêm, tạo issue trên GitHub hoặc liên hệ với maintainer.
