import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, RefreshControl } from 'react-native';
import supabase from '@/app/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';

type UserInfo = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  user_locations: {
    latitude: number;
    longitude: number;
    updated_at: string;
    address?: string;
    distance: number;  // bỏ dấu ?
  } | null;
  isCurrentUser?: boolean;
};

export default function Users() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);

  // Hàm tính khoảng cách giữa 2 điểm (theo km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Bán kính trái đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Format khoảng cách
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi',
            'User-Agent': 'YourAppName'
          }
        }
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Không thể lấy địa chỉ';
    }
  };

  const fetchUsers = async () => {
    try {
      // Lấy vị trí hiện tại
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);

      // Lấy thông tin user hiện tại
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // Lấy tất cả users
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
  .order('updated_at', { referencedTable: 'user_locations', ascending: false }) 
  .limit(1, { foreignTable: 'user_locations' }); // Lấy location mới nhất


      if (error) throw error;

      // Xử lý và thêm địa chỉ cho mỗi user
      const usersWithAddress = await Promise.all(
        data.map(async (user) => {
          const isCurrentUser = user.id === currentUser.id;
          if (user.user_locations?.[0]) {
            const address = await getAddressFromCoordinates(
              user.user_locations[0].latitude,
              user.user_locations[0].longitude
            );

            let distance = 0;
            if (!isCurrentUser && location) {
              distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                user.user_locations[0].latitude,
                user.user_locations[0].longitude
              );
            }

            return {
              ...user,
              isCurrentUser,
              user_locations: {
                ...user.user_locations[0],
                address,
                distance
              }
            };
          }
          // Trường hợp không có user_locations
          return {
            ...user,
            isCurrentUser,
            user_locations: null
          };
        })
      );

      // Sắp xếp với user hiện tại lên đầu, sau đó theo khoảng cách
      const sortedUsers = usersWithAddress.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return (a.user_locations?.distance || 0) - (b.user_locations?.distance || 0);
      });

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const renderUser = ({ item }: { item: UserInfo }) => (
    <View className={`p-4 bg-white mb-2 rounded-lg shadow ${item.isCurrentUser ? 'border-2 border-blue-500' : ''}`}>
      <View className="flex-row">
        {/* Avatar và thông tin cơ bản */}
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
          {/* Header với tên và khoảng cách */}
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-semibold">
              {item.full_name || 'Unnamed User'}
              {item.isCurrentUser && (
                <Text className="text-blue-500 text-sm"> (Bạn)</Text>
              )}
            </Text>
            {!item.isCurrentUser && item.user_locations?.distance && (
              <Text className="text-sm text-gray-500">
                {formatDistance(item.user_locations.distance)}
              </Text>
            )}
          </View>

          {/* Số điện thoại */}
          <Text className="text-gray-600 mb-1">
            {item.phone || 'Chưa có số điện thoại'}
          </Text>

          {/* Địa chỉ và thời gian cập nhật */}
          {item.user_locations ? (
            <View>
              <Text className="text-gray-600 text-sm">
                {item.user_locations.address || 'Đang tải địa chỉ...'}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                Cập nhật: {new Date(item.user_locations.updated_at).toLocaleString()}
              </Text>
            </View>
          ) : (
            <Text className="text-gray-500 italic">Vị trí không khả dụng</Text>
          )}
        </View>
      </View>
    </View>
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View className="flex-1 bg-gray-100">
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold mt-12">Danh sách người dùng</Text>
      </View>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchUsers();
              setRefreshing(false);
            }}
          />
        }
      />
    </View>
  );
}














