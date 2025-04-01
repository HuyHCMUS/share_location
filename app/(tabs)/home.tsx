import React, { useRef, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import MapView from 'react-native-maps';
import useLocation from '@/app/hooks/useLocation';
import DirectionsService from '@/app/services/directions.service';
import UserMarker from '@/app/components/map/UserMarker';
import RoutePolyline from '@/app/components/map/RoutePolyline';
import SelectedUserOverlay from '@/app/components/map/SelectedUserOverlay';
import { UserLocation, RouteCoordinates } from '@/app/types/location';

export default function Home() {
  const mapRef = useRef<MapView>(null);
  const { location, errorMsg, otherUsers } = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinates>([]);
  const [routeDistance, setRouteDistance] = useState<number | undefined>(undefined);

  const showRoute = async (userId: string) => {
    if (!location) return;
    
    const selectedUser = otherUsers.find(u => u.user_id === userId);
    if (!selectedUser) return;

    try {
      const result = await DirectionsService.getDirections(
        location.coords.latitude,
        location.coords.longitude,
        selectedUser.latitude,
        selectedUser.longitude
      );
      setRouteCoordinates(result.coordinates);
      setRouteDistance(result.distance);
    } catch (error) {
      Alert.alert('Error', 'Failed to get directions');
    }
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
        showsUserLocation
        showsMyLocationButton
        showsCompass
        zoomEnabled
        zoomControlEnabled
      >
        {otherUsers
          .filter(user => user.latitude && user.longitude)
          .map((user) => (
            <UserMarker
              key={user.user_id}
              user={user}
              onPress={setSelectedUserId}
            />
          ))}

        {routeCoordinates.length > 0 && (
          <RoutePolyline coordinates={routeCoordinates} />
        )}
      </MapView>

      {selectedUserId && (
        <SelectedUserOverlay
          user={otherUsers.find(u => u.user_id === selectedUserId)}
          onShowRoute={() => showRoute(selectedUserId)}
          onClose={() => {
            setSelectedUserId(null);
            setRouteCoordinates([]);
            setRouteDistance(undefined);
          }}
          routeDistance={routeDistance}
        />
      )}
    </View>
  );
}





