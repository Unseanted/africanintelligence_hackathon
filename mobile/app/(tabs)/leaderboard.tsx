import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Avatar } from 'react-native-paper';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LeaderboardPage() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Leaderboard</ThemedText>

        {/* Top Performers */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Top Performers</ThemedText>
          
          <View style={styles.topThree}>
            {/* Second Place */}
            <View style={[styles.topThreeItem, styles.secondPlace]}>
              <Avatar.Text 
                size={60} 
                label="JD" 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <ThemedText style={styles.rank}>2</ThemedText>
              <ThemedText style={styles.name}>Jane Doe</ThemedText>
              <ThemedText style={styles.points}>2,450 pts</ThemedText>
            </View>

            {/* First Place */}
            <View style={[styles.topThreeItem, styles.firstPlace]}>
              <Avatar.Text 
                size={80} 
                label="JS" 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <ThemedText style={styles.rank}>1</ThemedText>
              <ThemedText style={styles.name}>John Smith</ThemedText>
              <ThemedText style={styles.points}>3,120 pts</ThemedText>
            </View>

            {/* Third Place */}
            <View style={[styles.topThreeItem, styles.thirdPlace]}>
              <Avatar.Text 
                size={60} 
                label="RJ" 
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
              <ThemedText style={styles.rank}>3</ThemedText>
              <ThemedText style={styles.name}>Robert Johnson</ThemedText>
              <ThemedText style={styles.points}>2,100 pts</ThemedText>
            </View>
          </View>
        </View>

        {/* Full Rankings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Full Rankings</ThemedText>
          
          <Card style={styles.rankingCard}>
            <Card.Content>
              {[4, 5, 6, 7, 8, 9, 10].map((rank) => (
                <View key={rank} style={styles.rankingItem}>
                  <ThemedText style={styles.rankingNumber}>{rank}</ThemedText>
                  <Avatar.Text 
                    size={40} 
                    label={`U${rank}`} 
                    style={styles.rankingAvatar}
                    labelStyle={styles.avatarLabel}
                  />
                  <View style={styles.rankingInfo}>
                    <ThemedText style={styles.rankingName}>User {rank}</ThemedText>
                    <ThemedText style={styles.rankingPoints}>{2000 - (rank * 100)} pts</ThemedText>
                  </View>
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={24} 
                    color="#6b7280" 
                  />
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>

        {/* Your Ranking */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Ranking</ThemedText>
          <Card style={styles.yourRankingCard}>
            <Card.Content>
              <View style={styles.yourRankingContent}>
                <View style={styles.yourRankingInfo}>
                  <ThemedText style={styles.yourRankingTitle}>Current Rank</ThemedText>
                  <ThemedText style={styles.yourRankingNumber}>#15</ThemedText>
                  <ThemedText style={styles.yourRankingPoints}>1,850 points</ThemedText>
                </View>
                <View style={styles.yourRankingProgress}>
                  <ThemedText style={styles.yourRankingProgressText}>
                    Next Rank: 2,000 points
                  </ThemedText>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '75%' }]} />
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  topThree: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 24,
  },
  topThreeItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  firstPlace: {
    paddingBottom: 32,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  secondPlace: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  thirdPlace: {
    backgroundColor: 'rgba(180, 83, 9, 0.1)',
  },
  avatar: {
    backgroundColor: '#6366f1',
    marginBottom: 8,
  },
  avatarLabel: {
    color: '#ffffff',
  },
  rank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  points: {
    fontSize: 14,
    color: '#9ca3af',
  },
  rankingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  rankingNumber: {
    width: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  rankingAvatar: {
    backgroundColor: '#6366f1',
    marginRight: 12,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingName: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 2,
  },
  rankingPoints: {
    fontSize: 14,
    color: '#9ca3af',
  },
  yourRankingCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
  },
  yourRankingContent: {
    gap: 16,
  },
  yourRankingInfo: {
    alignItems: 'center',
  },
  yourRankingTitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  yourRankingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  yourRankingPoints: {
    fontSize: 16,
    color: '#6366f1',
  },
  yourRankingProgress: {
    gap: 8,
  },
  yourRankingProgressText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
}); 