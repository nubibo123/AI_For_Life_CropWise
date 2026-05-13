# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CropWise is a React Native Expo application for crop disease detection and farming community features. The app combines AI-powered disease prediction with social features for farmers to share knowledge and experiences.

## Development Commands

### Expo Development
```bash
cd CropWise
npm install              # Install dependencies
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios            # Run on iOS simulator
npm run web            # Run in web browser
npm run lint           # Run ESLint
```

### Backend (Python Disease Detection)
The disease detection API is in `CropWise/model/`:
```bash
cd CropWise/model
pip install -r requirements.txt
python app.py          # Start the disease detection API server
```

The API runs on port 8001 and is currently exposed via ngrok for mobile development.

## Architecture

### Tech Stack
- **Frontend**: React Native with Expo Router (file-based routing)
- **Backend**: Firebase (Auth, Firestore) + Python FastAPI for disease detection
- **Storage**: Cloudinary for images
- **State Management**: React Context (AuthContext)
- **UI**: Custom glass morphism components with expo-blur

### Directory Structure

```
CropWise/
├── app/                    # File-based routing (Expo Router)
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home/Crop selection
│   │   ├── my-field.tsx   # Field management
│   │   ├── fertilizer.tsx # Fertilizer calculator
│   │   ├── community.tsx  # Community feed
│   │   └── profile.tsx    # User profile
│   ├── community/         # Community features
│   ├── diseases/          # Disease detection results
│   ├── login.tsx          # Authentication
│   └── _layout.tsx        # Root layout with providers
├── components/
│   └── ui/               # Reusable UI components (GlassBackground, GlassCard, GlassInput)
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
├── services/            # API and data services
│   ├── firebase.ts      # Firebase initialization
│   ├── authService.ts   # Authentication logic
│   ├── communityService.ts  # Community posts/comments
│   ├── diseaseService.ts     # Disease prediction API
│   ├── cloudinaryService.ts  # Image upload
│   └── notificationService.ts # Push notifications
├── types/               # TypeScript interfaces
├── model/              # Python disease detection backend
│   ├── app.py         # FastAPI server
│   ├── model.pth      # Trained model weights
│   └── requirements.txt
└── firestore.rules    # Firestore security rules
```

### Key Architectural Patterns

#### Authentication Flow
- Firebase Auth handles user authentication
- `AuthContext` provides global auth state via `useAuth()` hook
- Auth state changes trigger automatic UI updates (login/logout redirects)
- AsyncStorage persists auth tokens on mobile

#### Data Layer
- **Firestore**: Real-time database for posts, comments, users, notifications
- **Services Pattern**: Each feature has a dedicated service file with CRUD operations
- **Real-time Subscriptions**: `subscribeTo*` functions for live updates
- **Transactions**: Used for atomic operations (likes, comment counts)

#### Disease Detection Pipeline
1. User selects/takes photo of crop leaf
2. Image uploaded to Python API via `diseaseService.predictDisease()`
3. Two-step process:
   - YOLOv8m-seg detects leaf regions
   - DenseNet121 classifies disease from detected leaf
4. Results include confidence scores, bounding boxes, and treatment info

#### Community Features
- Posts support multiple images, crop type tags, and voting
- Comments can be voted and marked as "best answer"
- Real-time updates via Firestore listeners
- Notifications for likes and comments
- User reputation system

#### UI Components
- Glass morphism design pattern (GlassBackground, GlassCard, GlassInput)
- expo-blur for frosted glass effects
- Safe area handling for notched devices
- Responsive tab navigation with blur backgrounds

### Firebase Collections

- **users**: User profiles (name, avatar, reputation)
- **posts**: Community posts with metadata
- **posts/{postId}/comments**: Nested comments
- **posts/{postId}/votes**: User votes on posts
- **posts/{postId}/comments/{commentId}/votes**: User votes on comments
- **notifications**: User notifications
- **fields**: User's field data

### API Configuration

The disease detection API URL is configured in `services/diseaseService.ts`:
- Development: Uses ngrok tunnel for mobile access
- Local development: Uncomment appropriate URL based on target platform
- Endpoints: `/predict` (single image), `/predict-batch` (multiple images)

### Important Notes

- **File-based routing**: Routes are automatically generated from `app/` directory structure
- **Type safety**: All services use TypeScript interfaces from `types/` directory
- **Error handling**: Services include comprehensive error logging with context
- **Image handling**: Cloudinary for storage, local URIs for preview before upload
- **Real-time features**: Use `subscribeTo*` functions instead of one-time fetches for live data
- **Authentication checks**: Many components redirect to `/login` if user is not authenticated
- **Platform differences**: Firebase initialization differs between web and mobile (AsyncStorage persistence)

### Testing Disease Detection

To test the disease detection feature:
1. Start the Python backend: `cd CropWise/model && python app.py`
2. Update `API_URL` in `services/diseaseService.ts` if needed
3. Use the app to capture/select leaf images
4. Check console logs for detailed prediction pipeline information

### Firestore Security

The app uses Firestore security rules defined in `firestore.rules` to ensure:
- Users can only read/write their own data
- Community posts are publicly readable but only authors can edit
- Proper authentication is required for write operations