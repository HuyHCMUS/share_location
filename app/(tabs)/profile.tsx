import { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import supabase from '@/app/lib/supabase';
import { router } from 'expo-router';
import { decode } from 'base64-arraybuffer';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: null as string | null
  });

  useEffect(() => {
    getUserData();
  }, []);

  async function getUserData() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');
      
      setUser(user);

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        avatar_url: profileData.avatar_url
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setLoading(true);
        const fileName = `avatar_${user.id}_${Date.now()}.jpg`;
        const base64FileData = result.assets[0].base64;
        
        // Upload image to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, decode(base64FileData), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        // Update profile with avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        Alert.alert('Success', 'Avatar updated successfully!');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      router.replace('/(auth)/login');
    }
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <TouchableOpacity 
        onPress={pickImage}
        className="items-center mb-6"
      >
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-32 h-32 rounded-full"
          />
        ) : (
          <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center">
            <FontAwesome name="user" size={64} color="#666" />
          </View>
        )}
        <Text className="text-blue-500 mt-2">Change Avatar</Text>
      </TouchableOpacity>

      <Text className="text-lg mb-2">Email: {user?.email}</Text>
      
      <Text className="text-gray-600 mb-1">Full Name</Text>
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Enter your full name"
        value={profile.full_name}
        onChangeText={(text) => setProfile(prev => ({ ...prev, full_name: text }))}
      />
      
      <Text className="text-gray-600 mb-1">Phone Number</Text>
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Enter your phone number"
        value={profile.phone}
        onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        className="h-12 bg-blue-500 rounded-lg items-center justify-center mb-4"
        onPress={updateProfile}
        disabled={loading}
      >
        <Text className="text-white font-semibold">
          {loading ? 'Updating...' : 'Update Profile'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="h-12 bg-red-500 rounded-lg items-center justify-center"
        onPress={signOut}
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}





