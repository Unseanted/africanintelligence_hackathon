import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ContentAnalyzer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ContentManagement = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigateToAnalyzer = () => {
    navigation.navigate('ContentAnalyzer');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Title title="Content Management" />
          <Card.Content>
            <Button
              mode="contained"
              onPress={handleNavigateToAnalyzer}
              style={styles.button}
              icon={({ size, color }) => (
                <Icon name="file-document-edit" size={size} color={color} />
              )}
            >
              Content Analyzer
            </Button>

            <Card style={styles.subCard}>
              <Card.Title title="Recent Submissions" />
              <Card.Content>
                <Text style={styles.emptyText}>
                  No recent submissions
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.subCard}>
              <Card.Title title="Contributors" />
              <Card.Content>
                <Text style={styles.emptyText}>
                  No contributors yet
                </Text>
              </Card.Content>
            </Card>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  subCard: {
    marginTop: 16,
  },
  button: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 16,
  },
});

export default ContentManagement; 