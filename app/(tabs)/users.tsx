import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import supabase from '@/app/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

type UserInfo = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_locations: {
    latitude: number;
    longitude: number;
    updated_at: string;
  } | null;
};

export default function Users() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        avatar_url,
        user_locations (
          latitude,
          longitude,
          updated_at
        )
      `)
      .order('full_name');

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    setUsers(data.map(user => ({
      ...user,
      user_locations: user.user_locations?.[0] || null
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUser = ({ item }: { item: UserInfo }) => (
    <View className="flex-row p-4 bg-white mb-2 rounded-lg shadow">
      <View className="mr-4">
        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
            <FontAwesome name="user" size={32} color="#666" />
          </View>
        )}
      </View>
      
      <View className="flex-1">
        <Text className="text-lg font-semibold">
          {item.full_name || 'Unnamed User'}
        </Text>
        <Text className="text-gray-600">
          {item.phone || 'No phone number'}
        </Text>
        {item.user_locations && typeof item.user_locations.latitude === 'number' && typeof item.user_locations.longitude === 'number' ? (
          <View>
            <Text className="text-gray-600">
              Lat: {item.user_locations.latitude.toFixed(6)}
            </Text>
            <Text className="text-gray-600">
              Long: {item.user_locations.longitude.toFixed(6)}
            </Text>
            <Text className="text-xs text-gray-400">
              Updated: {new Date(item.user_locations.updated_at).toLocaleString()}
            </Text>
          </View>
        ) : (
          <Text className="text-gray-500 italic">Location not available</Text>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100 pt-12">
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold">All Users</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
}



