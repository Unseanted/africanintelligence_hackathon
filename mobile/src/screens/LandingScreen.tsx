import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/ui/button';

export const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="px-4 pt-12 pb-8">
        <Text className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to African Intelligence
        </Text>
        <Text className="text-lg text-gray-600 mb-8">
          Your gateway to comprehensive learning and analysis tools
        </Text>
        <Button
          onPress={() => navigation.navigate('Login')}
          className="w-full"
        >
          Get Started
        </Button>
      </View>

      {/* Features Section */}
      <View className="px-4 py-8 bg-gray-50">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Key Features
        </Text>
        <View className="space-y-6">
          <FeatureCard
            icon="file-document"
            title="Content Analysis"
            description="Analyze PDFs and videos with advanced AI technology"
          />
          <FeatureCard
            icon="robot"
            title="AI-Powered Questions"
            description="Generate relevant questions based on your content"
          />
          <FeatureCard
            icon="chart-line"
            title="Progress Tracking"
            description="Monitor your learning progress and achievements"
          />
        </View>
      </View>

      {/* CTA Section */}
      <View className="px-4 py-12">
        <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Ready to Start Learning?
        </Text>
        <Text className="text-gray-600 mb-8 text-center">
          Join thousands of students already using our platform
        </Text>
        <Button
          onPress={() => navigation.navigate('Login')}
          className="w-full"
          variant="outline"
        >
          Sign In
        </Button>
      </View>
    </ScrollView>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <View className="bg-white p-4 rounded-lg shadow-sm">
    <View className="flex-row items-center mb-3">
      <Icon name={icon} size={24} color="#2563eb" />
      <Text className="text-lg font-semibold text-gray-900 ml-3">
        {title}
      </Text>
    </View>
    <Text className="text-gray-600">
      {description}
    </Text>
  </View>
); 