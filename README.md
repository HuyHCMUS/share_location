# Simple Map Application

A real-time location sharing mobile application built with Expo, React Native, and Supabase.

## Features

- Real-time location tracking and sharing
- User authentication (login/register)
- User profile management
- Interactive map view of all users
- User list with location details
- Profile customization with avatar upload

## Tech Stack

- **Frontend Framework**: React Native with Expo
- **Styling**: TailwindCSS (via NativeWind)
- **Backend/Database**: Supabase
- **Maps**: react-native-maps
- **Location Services**: expo-location
- **File Storage**: Supabase Storage
- **Navigation**: Expo Router
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio & Android SDK (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd simple-map
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## Project Structure

```
simple-map/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── home.tsx
│   │   ├── users.tsx
│   │   ├── profile.tsx
│   │   └── _layout.tsx
│   ├── lib/
│   │   └── supabase.ts
│   └── _layout.tsx
├── assets/
└── docs/
```

## Key Components

### Home Screen (`app/(tabs)/home.tsx`)
- Displays interactive map with real-time user locations
- Handles location permissions and updates
- Real-time location sync with Supabase

### Users Screen (`app/(tabs)/users.tsx`)
- Lists all users with their latest locations
- Shows user profiles with avatars
- Displays location update timestamps

### Profile Screen (`app/(tabs)/profile.tsx`)
- User profile management
- Avatar upload functionality
- Profile information updates

## Database Schema

### Tables

1. `profiles`
   - `id`: UUID (Primary Key)
   - `full_name`: Text
   - `phone`: Text
   - `avatar_url`: Text
   - `updated_at`: Timestamp

2. `user_locations`
   - `user_id`: UUID (Foreign Key)
   - `latitude`: Float
   - `longitude`: Float
   - `updated_at`: Timestamp

## Environment Setup

1. iOS Development:
   - Install Xcode
   - Set up iOS Simulator

2. Android Development:
   - Install Android Studio
   - Set up Android Emulator
   - Configure Android SDK

## Permissions

The app requires the following permissions:

- Location access (foreground)
- Camera/Photo Library (for avatar upload)
- Internet access

## Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request