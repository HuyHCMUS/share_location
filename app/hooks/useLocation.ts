import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { LocationService } from '../services/location.service';
import { UserLocation } from '@/app/types/location';;
import supabase from '@/app/lib/supabase';

function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otherUsers, setOtherUsers] = useState<UserLocation[]>([]);
  
  useEffect(() => {
    const locationUpdateChannel = supabase.channel('location_updates');
    
    const initialize = async () => {
      try {
        await LocationService.requestPermissions();
        const location = await LocationService.getCurrentPosition();
        setLocation(location);
        await LocationService.updateUserLocation(
          location.coords.latitude,
          location.coords.longitude
        );
        // Fetch initial other users' locations
        const users = await LocationService.fetchOtherUsersLocations();
        setOtherUsers(users);
      } catch (error) {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    };

    const setupLocationWatch = async () => {
      const subscription = await LocationService.watchPosition((location) => {
        setLocation(location);
        LocationService.updateUserLocation(
          location.coords.latitude,
          location.coords.longitude
        );
      });
      return subscription;
    };

    const setupRealtimeSubscription = () => {
      locationUpdateChannel
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'user_locations' 
          }, 
          () => {
            LocationService.fetchOtherUsersLocations()
              .then(setOtherUsers)
              .catch(console.error);
          }
        )
        .subscribe();
    };

    initialize();
    const subscriptionPromise = setupLocationWatch();
    setupRealtimeSubscription();

    return () => {
      subscriptionPromise.then(sub => sub.remove());
      locationUpdateChannel.unsubscribe();
    };
  }, []);

  return { location, errorMsg, otherUsers };
}

export default useLocation;
