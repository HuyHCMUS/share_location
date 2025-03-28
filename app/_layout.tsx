import { Slot, useSegments, useRouter } from "expo-router";
import "./global.css"
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import supabase from "./lib/supabase";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      checkUser();
    }
  }, [loading]);

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      await supabase.auth.getSession();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const inAuthGroup = segments[0] === '(auth)';
      
      if (session && inAuthGroup) {
        router.replace('/(tabs)/home');
      } else if (!session && !inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
}


