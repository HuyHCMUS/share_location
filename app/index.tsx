import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import supabase from './lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null); // Fix lỗi

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session); // Không còn lỗi TypeScript
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
