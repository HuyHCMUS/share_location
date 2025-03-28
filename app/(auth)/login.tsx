import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import supabase from '@/app/lib/supabase';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      console.log('login error',error.message);
    } else {
      router.replace('/(tabs)/home');
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center px-4 bg-white">
      <Text className="text-2xl font-bold text-center mb-6">Welcome Back</Text>
      
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="h-12 bg-blue-500 rounded-lg items-center justify-center mb-4"
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text className="text-white font-semibold">
          {loading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="mt-4" 
        onPress={() => router.push('/(auth)/register')}
      >
        <Text className="text-center text-blue-500">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

