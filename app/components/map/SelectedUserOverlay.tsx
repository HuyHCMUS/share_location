import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { UserLocation } from '@/app/types/location';

type Props = {
  user: UserLocation | undefined;
  onShowRoute: () => void;
  onClose: () => void;
};

function SelectedUserOverlay({ user, onShowRoute, onClose }: Props) {
  if (!user) return null;

  return (
    <View className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
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
    </View>
  );
}

export default SelectedUserOverlay;
