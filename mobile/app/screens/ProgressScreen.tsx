import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ProgressScreen = () => {
  const learningStats = [
    {
      id: 1,
      title: 'Total Learning Hours',
      value: '24.5',
      icon: 'clock-outline',
    },
    {
      id: 2,
      title: 'Content Analyzed',
      value: '12',
      icon: 'file-document',
    },
    {
      id: 3,
      title: 'Questions Answered',
      value: '156',
      icon: 'help-circle',
    },
    {
      id: 4,
      title: 'Average Score',
      value: '85%',
      icon: 'chart-line',
    },
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Quick Learner',
      description: 'Completed 5 modules in one day',
      icon: 'lightning-bolt',
      date: '2 days ago',
    },
    {
      id: 2,
      title: 'Perfect Score',
      description: 'Achieved 100% in African History Quiz',
      icon: 'star',
      date: '1 week ago',
    },
    {
      id: 3,
      title: 'Content Master',
      description: 'Analyzed 10 different content pieces',
      icon: 'trophy',
      date: '2 weeks ago',
    },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-12 pb-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Learning Progress
        </Text>
        <Text className="text-gray-600">
          Track your achievements and growth
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="px-4 py-6">
        <View className="flex-row flex-wrap">
          {learningStats.map((stat) => (
            <View key={stat.id} className="w-1/2 p-2">
              <Card className="p-4">
                <Icon name={stat.icon} size={24} color="#2563eb" />
                <Text className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {stat.title}
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </View>

      {/* Learning Progress */}
      <View className="px-4 py-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Learning Progress
        </Text>
        <Card className="p-4">
          <View className="space-y-4">
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm font-medium text-gray-700">
                  African History
                </Text>
                <Text className="text-sm text-gray-600">75%</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full">
                <View
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: '75%' }}
                />
              </View>
            </View>
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm font-medium text-gray-700">
                  Modern Politics
                </Text>
                <Text className="text-sm text-gray-600">45%</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full">
                <View
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: '45%' }}
                />
              </View>
            </View>
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-sm font-medium text-gray-700">
                  Literature Analysis
                </Text>
                <Text className="text-sm text-gray-600">90%</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full">
                <View
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: '90%' }}
                />
              </View>
            </View>
          </View>
        </Card>
      </View>

      {/* Achievements */}
      <View className="px-4 py-6">
        <Text className="text-xl font-bold text-gray-900 mb-4">
          Recent Achievements
        </Text>
        <View className="space-y-4">
          {recentAchievements.map((achievement) => (
            <Card key={achievement.id} className="p-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center">
                  <Icon name={achievement.icon} size={24} color="#2563eb" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {achievement.title}
                  </Text>
                  <Text className="text-gray-600">
                    {achievement.description}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    {achievement.date}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProgressScreen; 