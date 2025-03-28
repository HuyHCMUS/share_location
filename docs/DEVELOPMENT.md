# Development Guide

## Setting Up the Development Environment

### 1. Supabase Configuration

#### Database Tables Setup

Execute the following SQL to create required tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create user_locations table
CREATE TABLE user_locations (
    user_id UUID REFERENCES auth.users,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO public
USING (auth.uid() = id);

CREATE POLICY "Location viewable by everyone"
ON user_locations FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own location"
ON user_locations FOR UPDATE
TO public
USING (auth.uid() = user_id);
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Development Workflow

1. **Start Development Server**
```bash
npx expo start
```

2. **Running on Simulators/Emulators**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator

3. **Testing on Physical Devices**
- Install Expo Go app
- Scan QR code from terminal

### 4. Code Style Guidelines

- Use TypeScript for type safety
- Follow React Native best practices
- Use NativeWind for styling
- Implement error handling
- Add comments for complex logic

### 5. Testing

- Test on both iOS and Android
- Verify location updates
- Check real-time functionality
- Test authentication flow
- Validate profile updates

### 6. Common Issues and Solutions

1. **Location Permission Issues**
   - Verify AndroidManifest.xml permissions
   - Check iOS Info.plist settings

2. **Map Display Problems**
   - Ensure Google Maps API key is set
   - Verify map initialization

3. **Real-time Updates**
   - Check Supabase subscription setup
   - Verify WebSocket connections

### 7. Performance Optimization

1. **Location Updates**
   - Optimize update frequency
   - Balance accuracy vs battery life

2. **Image Handling**
   - Compress images before upload
   - Cache avatar images

3. **Map Rendering**
   - Implement marker clustering
   - Optimize re-renders

