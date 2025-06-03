import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Implement login logic
    navigation.navigate('StudentTabs');
  };

  return (
    <View className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="pt-12 pb-8">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-6"
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-600">
          Sign in to continue your learning journey
        </Text>
      </View>

      {/* Login Form */}
      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Email
          </Text>
          <Input
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1">
            Password
          </Text>
          <Input
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity className="self-end">
          <Text className="text-blue-600 font-medium">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <Button
          onPress={handleLogin}
          className="w-full mt-6"
        >
          Sign In
        </Button>
      </View>

      {/* Social Login */}
      <View className="mt-8">
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-4 text-gray-500">or continue with</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
            <Icon name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 rounded-full border border-gray-300 items-center justify-center">
            <Icon name="microsoft" size={24} color="#00A4EF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Link */}
      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-600">Don't have an account? </Text>
        <TouchableOpacity>
          <Text className="text-blue-600 font-medium">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 