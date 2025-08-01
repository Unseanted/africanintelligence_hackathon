import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Card, IconButton, ProgressBar, Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';

interface Activity {
  title: string;
  date: string;
  type: string;
  icon?: string;
}

interface CourseProgress {
  name: string;
  progress: number;
  expectedCompletion: string;
}

interface SkillAssessment {
  skill: string;
  level: number;
  trend: 'up' | 'down' | 'neutral';
}

interface Recommendation {
  title: string;
  type: 'course' | 'resource' | 'activity';
  reason: string;
}

interface AnalyticsData {
  totalCourses: number;
  completedModules: number;
  contentCompletion: number;
  averageScore: number;
  engagementScore: number;
  timeSpent: number; // in minutes
  recentActivity: Activity[];
  weeklyProgress: number[];
  courseProgress: CourseProgress[];
  skillAssessments: SkillAssessment[];
  recommendations: Recommendation[];
  aiInsights: string[];
}

const Analytics: React.FC = () => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width - 32;

  // Enhanced dummy data with AI features
  const analyticsData: AnalyticsData = {
    totalCourses: 5,
    completedModules: 12,
    contentCompletion: 0.75,
    averageScore: 85,
    engagementScore: 78,
    timeSpent: 1245,
    recentActivity: [
      { title: 'Content Analysis', date: '2024-02-20', type: 'PDF', icon: 'file-pdf' },
      { title: 'Question Generation', date: '2024-02-19', type: 'Video', icon: 'video' },
      { title: 'AI Tutor Session', date: '2024-02-18', type: 'Chat', icon: 'chat' },
      { title: 'Practice Quiz', date: '2024-02-17', type: 'Quiz', icon: 'help-circle' },
    ],
    weeklyProgress: [30, 45, 60, 55, 70, 75, 80],
    courseProgress: [
      { name: 'Advanced AI Concepts', progress: 0.65, expectedCompletion: '2 weeks' },
      { name: 'Machine Learning Fundamentals', progress: 0.9, expectedCompletion: '3 days' },
      { name: 'Data Visualization', progress: 0.3, expectedCompletion: '4 weeks' },
    ],
    skillAssessments: [
      { skill: 'Python', level: 85, trend: 'up' },
      { skill: 'TensorFlow', level: 70, trend: 'up' },
      { skill: 'Data Analysis', level: 78, trend: 'neutral' },
      { skill: 'NLP', level: 65, trend: 'down' },
    ],
    recommendations: [
      { 
        title: 'Neural Networks Deep Dive', 
        type: 'course', 
        reason: 'Based on your interest in AI and current skill gaps' 
      },
      { 
        title: 'Interactive Python Challenge', 
        type: 'activity', 
        reason: 'To reinforce your Python skills with practical exercises' 
      },
    ],
    aiInsights: [
      "You learn best in the mornings - try scheduling study sessions before noon",
      "Your engagement drops with video content longer than 15 minutes - consider breaking them up",
      "You perform 23% better on assessments after interactive exercises"
    ],
  };

  const chartConfig = {
    backgroundColor: colors.cardBackground,
    backgroundGradientFrom: colors.cardBackground,
    backgroundGradientTo: colors.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(colors.primary)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${hexToRgb(colors.text)}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  }

  const skillData = analyticsData.skillAssessments.map(skill => ({
    name: skill.skill,
    level: skill.level,
    color: colors.primary,
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'trending-neutral';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return colors.info;
      case 'video': return colors.warning;
      case 'quiz': return colors.error;
      case 'chat': return colors.success;
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        {/* Overview Card */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              Learning Overview
            </Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {analyticsData.totalCourses}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  Courses
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {analyticsData.completedModules}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  Modules
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {analyticsData.averageScore}%
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  Avg Score
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="titleMedium" style={{ color: colors.text }}>
                  {Math.floor(analyticsData.timeSpent / 60)}h
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  Time Spent
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text variant="titleSmall" style={{ color: colors.text }}>
                  Weekly Engagement
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  {analyticsData.engagementScore}/100
                </Text>
              </View>
              <ProgressBar 
                progress={analyticsData.engagementScore / 100} 
                color={colors.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Progress Chart */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              Weekly Progress
            </Text>
            <LineChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                  {
                    data: analyticsData.weeklyProgress,
                  },
                ],
              }}
              width={screenWidth}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 8,
              }}
            />
          </Card.Content>
        </Card>

        {/* Course Progress */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              Course Progress
            </Text>
            {analyticsData.courseProgress.map((course, index) => (
              <View key={index} style={styles.courseItem}>
                <View>
                  <Text variant="titleSmall" style={{ color: colors.text }}>
                    {course.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                    Expected completion: {course.expectedCompletion}
                  </Text>
                </View>
                <ProgressBar 
                  progress={course.progress} 
                  color={colors.primary}
                  style={styles.courseProgressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Skill Assessment */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              Skill Assessment
            </Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={skillData}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                accessor="level"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            <View style={styles.skillList}>
              {analyticsData.skillAssessments.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text variant="bodyMedium" style={{ color: colors.text, flex: 1 }}>
                    {skill.skill}
                  </Text>
                  <View style={styles.skillLevelContainer}>
                    <IconButton
                      icon={getTrendIcon(skill.trend)}
                      size={16}
                      iconColor={
                        skill.trend === 'up' 
                          ? colors.success 
                          : skill.trend === 'down' 
                            ? colors.error 
                            : colors.textSecondary
                      }
                    />
                    <Text variant="bodyMedium" style={{ color: colors.text, width: 40 }}>
                      {skill.level}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* AI Recommendations */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              AI Recommendations
            </Text>
            {analyticsData.recommendations.map((rec, index) => (
              <View 
                key={index} 
                style={[
                  styles.recommendationItem, 
                  { backgroundColor: colors.surfaceVariant, borderColor: colors.borderColor }
                ]}
              >
                <Text variant="titleSmall" style={{ color: colors.text }}>
                  {rec.title}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginVertical: 4 }}>
                  {rec.type.toUpperCase()}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.text }}>
                  {rec.reason}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* AI Insights */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              AI Insights
            </Text>
            {analyticsData.aiInsights.map((insight, index) => (
              <View 
                key={index} 
                style={[
                  styles.insightItem, 
                  { backgroundColor: colors.surfaceVariant, borderColor: colors.borderColor }
                ]}
              >
                <IconButton
                  icon="lightbulb-on"
                  iconColor={colors.warning}
                  size={20}
                  style={{ marginRight: 8 }}
                />
                <Text variant="bodyMedium" style={{ color: colors.text, flex: 1 }}>
                  {insight}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Card.Content>
            <Text variant="titleLarge" style={{ color: colors.text, marginBottom: 16 }}>
              Recent Activity
            </Text>
            {analyticsData.recentActivity.map((activity, index) => (
              <View
                key={index}
                style={[
                  styles.activityItem, 
                  { 
                    borderBottomColor: colors.borderColor,
                    borderBottomWidth: index === analyticsData.recentActivity.length - 1 ? 0 : 1
                  }
                ]}
              >
                <View style={styles.activityContent}>
                  {activity.icon && (
                    <IconButton
                      icon={activity.icon}
                      iconColor={getTypeColor(activity.type)}
                      size={20}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <View>
                    <Text variant="titleSmall" style={{ color: colors.text }}>
                      {activity.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                      {activity.date}
                    </Text>
                  </View>
                </View>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.activityType, 
                    { 
                      backgroundColor: getTypeColor(activity.type), 
                      color: colors.onPrimary 
                    }
                  ]}
                >
                  {activity.type}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  courseItem: {
    marginBottom: 16,
  },
  courseProgressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  skillList: {
    marginTop: 16,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  skillLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityType: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default Analytics;