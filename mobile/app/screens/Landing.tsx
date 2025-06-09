import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Landing() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-4">
        <Icon name="school" size={80} color="#2563eb" className="mb-8" />
        
        <Text className="text-3xl font-bold text-center mb-4">
          Welcome to African Intelligence
        </Text>
        
        <Text className="text-lg text-center text-gray-600 mb-8">
          Empowering African youth through education and technology
        </Text>

        <View className="w-full space-y-4">
          <Button
            mode="contained"
            onPress={() => (navigation as any).navigate('Login')}
            className="w-full"
          >
            Login
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => (navigation as any).navigate('Register')}
            className="w-full"
          >
            Register
          </Button>
        </View>
      </View>
    </View>
  );
} 