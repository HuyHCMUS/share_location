import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { UserLocation } from '@/app/types/location';

type Props = {
  user: UserLocation | undefined;
  onShowRoute: () => void;
  onClose: () => void;
  routeDistance?: number;
};

function SelectedUserOverlay({ user, onShowRoute, onClose, routeDistance }: Props) {
  if (!user) return null;

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <View className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onShowRoute}
            className="bg-blue-500 rounded-full p-3 mr-2"
          >
            <FontAwesome name="location-arrow" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-200 rounded-full p-3"
          >
            <FontAwesome name="times" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        {routeDistance !== undefined && (
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="text-gray-700 font-medium">
              {formatDistance(routeDistance)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default SelectedUserOverlay;
