import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/card';

export const StudentDashboard = () => {
  const navigation = useNavigation();

  const recentContent = [
    {
      id: 1,
      title: 'Introduction to African History',
      type: 'PDF',
      progress: 75,
    },
    {
      id: 2,
      title: 'Modern African Politics',
      type: 'Video',
      progress: 30,
    },
    {
      id: 3,
      title: 'African Literature Analysis',
      type: 'PDF',
      progress: 90,
    },
  ];

  const stats = [
    {
      id: 1,
      title: 'Content Analyzed',
      value: '12',
      icon: 'file-document',
    },
    {
      id: 2,
      title: 'Questions Generated',
      value: '48',
      icon: 'help-circle',
    },
    {
      id: 3,
      title: 'Average Score',
      value: '85%',
      icon: 'chart-line',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-12 pb-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, Student!
        </Text>
        <Text className="text-gray-600">
          Continue your learning journey
        </Text>
      </View>

      {/* Stats */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between">
          {stats.map((stat) => (
            <Card key={stat.id} className="flex-1 mx-1 p-4">
              <Icon name={stat.icon} size={24} color="#2563eb" />
              <Text className="text-2xl font-bold text-gray-900 mt-2">
                {stat.value}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {stat.title}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Recent Content */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">
            Recent Content
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Content')}
          >
            <Text className="text-blue-600 font-medium">
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentContent.map((content) => (
          <Card key={content.id} className="mb-4 p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {content.title}
                </Text>
                <Text className="text-gray-600 mt-1">
                  {content.type}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-blue-600 font-medium">
                  {content.progress}%
                </Text>
                <View className="w-16 h-2 bg-gray-200 rounded-full mt-2">
                  <View
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${content.progress}%` }}
                  />
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="px-4 py-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => navigation.navigate('Content')}
          >
            <Card className="p-4 items-center">
              <Icon name="file-upload" size={24} color="#2563eb" />
              <Text className="text-gray-900 font-medium mt-2">
                Upload Content
              </Text>
            </Card>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-1/2 p-2"
            onPress={() => navigation.navigate('Content')}
          >
            <Card className="p-4 items-center">
              <Icon name="robot" size={24} color="#2563eb" />
              <Text className="text-gray-900 font-medium mt-2">
                Generate Questions
              </Text>
            </Card>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}; 