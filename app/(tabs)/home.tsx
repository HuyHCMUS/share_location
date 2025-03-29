import { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, Platform, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import supabase from '@/app/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

type UserLocation = {
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null; // Thêm avatar_url
  } | null;
};

export default function Home() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<UserLocation[]>([]);
  const mapRef = useRef<MapView>(null);
  const locationUpdateChannel = supabase.channel('location_updates');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      updateUserLocation(location.coords.latitude, location.coords.longitude);
    })();

    // Subscribe to location updates
    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // Update every 10 meters
      },
      (location) => {
        setLocation(location);
        updateUserLocation(location.coords.latitude, location.coords.longitude);
      }
    );

    // Subscribe to real-time updates
    setupRealtimeSubscription();

    // Fetch initial other users' locations
    fetchOtherUsersLocations();

    return () => {
      locationSubscription.then(sub => sub.remove());
      locationUpdateChannel.unsubscribe();
    };
  }, []);

  const setupRealtimeSubscription = () => {
    locationUpdateChannel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_locations' 
        }, 
        payload => {
          fetchOtherUsersLocations();
        }
      )
      .subscribe();
  };

  const updateUserLocation = async (latitude: number, longitude: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: user.id,
        latitude,
        longitude,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error updating location:', error);
    }
  };

  const fetchOtherUsersLocations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Lấy location mới nhất của mỗi user
    const { data, error } = await supabase
      .from('user_locations')
      .select(`
        user_id,
        latitude,
        longitude,
        updated_at,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .neq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching locations:', error);
      return;
    }

    // Lọc để chỉ lấy location mới nhất của mỗi user
    const latestLocations = data.reduce((acc: UserLocation[], curr) => {
      const existingUser = acc.find(u => u.user_id === curr.user_id);
      if (!existingUser) {
        acc.push({
          ...curr,
          profiles: curr.profiles || null
        });
      }
      return acc;
    }, []);

    setOtherUsers(latestLocations);
  };

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-center px-4">{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading location...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        zoomEnabled={true}
        zoomControlEnabled={true}
      >
        {otherUsers.filter(user => user.latitude && user.longitude).map((user) => (
          <Marker
            key={`${user.user_id}-${user.updated_at}`}
            coordinate={{
              latitude: user.latitude,
              longitude: user.longitude,
            }}
            title={user.profiles?.full_name || 'Unnamed User'}
          >
            <View className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
              {user.profiles?.avatar_url ? (
                <Image
                  source={{ uri: user.profiles.avatar_url }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full bg-green-500 items-center justify-center">
                  <FontAwesome name="user" size={20} color="white" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
















