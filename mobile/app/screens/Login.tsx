import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement login logic
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-1 justify-center">
        <Text className="text-3xl font-bold text-center mb-8">Login</Text>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          className="mb-4"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          className="mb-6"
          secureTextEntry
        />
        
        <Button
          mode="contained"
          onPress={handleLogin}
          className="mb-4"
        >
          Login
        </Button>
        
        <Button
          mode="text"
          onPress={() => router.push('/register')}
        >
          Don&apos;t have an account? Register
        </Button>
      </View>
    </View>
  );
} 