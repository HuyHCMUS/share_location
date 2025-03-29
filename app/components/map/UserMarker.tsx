import React from 'react';
import { View, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { UserLocation } from '@/app/types/location';

type Props = {
  user: UserLocation;
  onPress: (userId: string) => void;
};

function UserMarker({ user, onPress }: Props) {
  return (
    <Marker
      coordinate={{
        latitude: user.latitude,
        longitude: user.longitude,
      }}
      title={user.profiles?.full_name || 'Unnamed User'}
      onPress={() => onPress(user.user_id)}
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
  );
}

export default UserMarker;
