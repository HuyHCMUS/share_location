import * as Location from 'expo-location';
import supabase from '@/app/lib/supabase';
import { UserLocation } from  '@/app/types/location';;

export class LocationService {
  static async requestPermissions() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
  }

  static async getCurrentPosition() {
    return await Location.getCurrentPositionAsync({});
  }

  static watchPosition(callback: (location: Location.LocationObject) => void) {
    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      callback
    );
  }

  static async updateUserLocation(latitude: number, longitude: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return await supabase
      .from('user_locations')
      .upsert({
        user_id: user.id,
        latitude,
        longitude,
        updated_at: new Date().toISOString(),
      });
  }

  static async fetchOtherUsersLocations(): Promise<UserLocation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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

    if (error) throw error;

    return data.reduce((acc: UserLocation[], curr) => {
      const existingUser = acc.find(u => u.user_id === curr.user_id);
      if (!existingUser) {
        acc.push({
          ...curr,
          profiles: curr.profiles || null
        });
      }
      return acc;
    }, []);
  }
}

const locationService = {
  requestPermissions: LocationService.requestPermissions,
  getCurrentPosition: LocationService.getCurrentPosition,
  watchPosition: LocationService.watchPosition,
  updateUserLocation: LocationService.updateUserLocation,
  fetchOtherUsersLocations: LocationService.fetchOtherUsersLocations,
};

export default locationService;
