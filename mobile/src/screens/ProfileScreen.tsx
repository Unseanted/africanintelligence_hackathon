import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ProfileScreen = () => {
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 1,
      title: 'Account Settings',
      icon: 'account-cog',
      onPress: () => {},
    },
    {
      id: 2,
      title: 'Notification Preferences',
      icon: 'bell',
      onPress: () => {},
    },
    {
      id: 3,
      title: 'Privacy Settings',
      icon: 'shield-lock',
      onPress: () => {},
    },
    {
      id: 4,
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => {},
    },
    {
      id: 5,
      title: 'About',
      icon: 'information',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="px-4 pt-12 pb-6 bg-white">
        <View className="items-center">
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-4">
            <Icon name="account" size={48} color="#666" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            John Doe
          </Text>
          <Text className="text-gray-600">
            john.doe@example.com
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">12</Text>
            <Text className="text-gray-600">Content</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">48</Text>
            <Text className="text-gray-600">Questions</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-gray-900">85%</Text>
            <Text className="text-gray-600">Score</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="px-4 py-6">
        <Card className="overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className={`flex-row items-center p-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <Icon name={item.icon} size={24} color="#666" />
              <Text className="text-gray-900 ml-4 flex-1">
                {item.title}
              </Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      {/* Logout Button */}
      <View className="px-4 py-6">
        <Button
          variant="outline"
          onPress={() => navigation.navigate('Landing')}
          className="w-full"
        >
          Sign Out
        </Button>
      </View>

      {/* App Version */}
      <View className="px-4 py-6">
        <Text className="text-center text-gray-500">
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}; 