import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import supabase from '@/app/lib/supabase';
import { router } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: '',
            phone: '',
            avatar_url: null
          });

        if (profileError) throw profileError;
      }

      console.log('Registration successful');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      console.log('registration error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center px-4 bg-white">
      <Text className="text-2xl font-bold text-center mb-6">Create Account</Text>
      
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-4"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        className="h-12 border border-gray-300 rounded-lg px-4 mb-6"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="h-12 bg-blue-500 rounded-lg items-center justify-center mb-4"
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text className="text-white font-semibold">
          {loading ? 'Creating account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="mt-4" 
        onPress={() => router.push('/(auth)/login')}
      >
        <Text className="text-center text-blue-500">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}

