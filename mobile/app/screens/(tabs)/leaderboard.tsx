import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Avatar,
  Card,
  IconButton,
  ProgressBar,
  Text,
} from "react-native-paper";
import { useTheme } from '../../contexts/ThemeContext'; // Adjust the import path
import { useToast } from "../../../hooks/use-toast";

const { width } = Dimensions.get("window");

interface LeaderboardEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
    department?: string;
  };
  points: number;
  xp: number;
  rank: number;
  completedCourses: number;
  completedChallenges: number;
  badges: string[];
  streak: number;
  lastActive: string;
  achievements: {
    name: string;
    icon: string;
    description: string;
    unlockedAt: string;
  }[];
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progress?: number;
}

interface LeaderboardStats {
  totalParticipants: number;
  averagePoints: number;
  topScore: number;
  activeUsers: number;
  totalXp: number;
  averageLevel: number;
  topStreak: number;
  recentActivity: {
    type: string;
    user: string;
    points: number;
    timestamp: string;
  }[];
  distribution: {
    level: number;
    count: number;
  }[];
}

const DefaultAvatar = ({ size, style }: { size: number; style?: any }) => (
  <View
    style={[
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#e1e1e1",
        justifyContent: "center",
        alignItems: "center",
      },
      style,
    ]}
  >
    <MaterialCommunityIcons name="account" size={size * 0.6} color="#888" />
  </View>
);

const dummyEntries: LeaderboardEntry[] = [
  {
    _id: "1",
    user: {
      _id: "1",
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      role: "Manager",
      department: "Sales",
    },
    points: 1250,
    xp: 8500,
    rank: 1,
    completedCourses: 12,
    completedChallenges: 8,
    badges: ["medal", "trophy", "star"],
    streak: 15,
    lastActive: "2025-07-27T10:30:00Z",
    achievements: [
      {
        name: "Course Master",
        icon: "book",
        description: "Completed 10 courses",
        unlockedAt: "2025-06-20",
      },
      {
        name: "Streak Champion",
        icon: "fire",
        description: "7-day activity streak",
        unlockedAt: "2025-07-10",
      },
    ],
    level: 8,
    nextLevelXp: 10000,
    currentLevelXp: 8500,
    progress: 85,
  },
  {
    _id: "2",
    user: {
      _id: "2",
      name: "Sarah Williams",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      role: "Developer",
      department: "Engineering",
    },
    points: 1100,
    xp: 7800,
    rank: 2,
    completedCourses: 10,
    completedChallenges: 7,
    badges: ["medal", "certificate"],
    streak: 12,
    lastActive: "2025-07-27T09:15:00Z",
    achievements: [
      {
        name: "Quick Learner",
        icon: "lightning-bolt",
        description: "Completed 5 courses in one week",
        unlockedAt: "2025-06-15",
      },
    ],
    level: 7,
    nextLevelXp: 8000,
    currentLevelXp: 7800,
    progress: 97.5,
  },
  {
    _id: "3",
    user: {
      _id: "3",
      name: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      role: "Designer",
      department: "Creative",
    },
    points: 950,
    xp: 6500,
    rank: 3,
    completedCourses: 8,
    completedChallenges: 5,
    badges: ["trophy"],
    streak: 8,
    lastActive: "2025-07-26T14:45:00Z",
    achievements: [
      {
        name: "Creative Mind",
        icon: "palette",
        description: "Completed all design courses",
        unlockedAt: "2025-05-28",
      },
    ],
    level: 6,
    nextLevelXp: 7000,
    currentLevelXp: 6500,
    progress: 92.8,
  },
  {
    _id: "4",
    user: {
      _id: "4",
      name: "Emily Davis",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      role: "Analyst",
      department: "Data",
    },
    points: 850,
    xp: 5800,
    rank: 4,
    completedCourses: 7,
    completedChallenges: 4,
    badges: ["star"],
    streak: 5,
    lastActive: "2025-07-26T11:20:00Z",
    achievements: [
      {
        name: "Data Wizard",
        icon: "chart-bar",
        description: "Completed all analytics courses",
        unlockedAt: "2025-06-05",
      },
    ],
    level: 5,
    nextLevelXp: 6000,
    currentLevelXp: 5800,
    progress: 96.7,
  },
  {
    _id: "5",
    user: {
      _id: "5",
      name: "David Wilson",
      role: "Developer",
      department: "Engineering",
    },
    points: 800,
    xp: 5200,
    rank: 5,
    completedCourses: 6,
    completedChallenges: 3,
    badges: [],
    streak: 4,
    lastActive: "2025-07-25T16:10:00Z",
    achievements: [],
    level: 5,
    nextLevelXp: 6000,
    currentLevelXp: 5200,
    progress: 86.7,
  },
  {
    _id: "6",
    user: {
      _id: "6",
      name: "Jessica Lee",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      role: "Manager",
      department: "Marketing",
    },
    points: 750,
    xp: 4800,
    rank: 6,
    completedCourses: 5,
    completedChallenges: 3,
    badges: ["star"],
    streak: 3,
    lastActive: "2025-07-25T10:45:00Z",
    achievements: [
      {
        name: "Marketing Guru",
        icon: "bullhorn",
        description: "Completed all marketing courses",
        unlockedAt: "2025-05-15",
      },
    ],
    level: 4,
    nextLevelXp: 5000,
    currentLevelXp: 4800,
    progress: 96,
  },
  {
    _id: "7",
    user: {
      _id: "7",
      name: "Robert Garcia",
      avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      role: "Developer",
      department: "Engineering",
    },
    points: 700,
    xp: 4200,
    rank: 7,
    completedCourses: 4,
    completedChallenges: 2,
    badges: [],
    streak: 2,
    lastActive: "2025-07-24T15:30:00Z",
    achievements: [],
    level: 4,
    nextLevelXp: 5000,
    currentLevelXp: 4200,
    progress: 84,
  },
  {
    _id: "8",
    user: {
      _id: "8",
      name: "Olivia Martinez",
      avatar: "https://randomuser.me/api/portraits/women/4.jpg",
      role: "Designer",
      department: "Creative",
    },
    points: 650,
    xp: 3800,
    rank: 8,
    completedCourses: 3,
    completedChallenges: 2,
    badges: [],
    streak: 1,
    lastActive: "2025-07-24T09:20:00Z",
    achievements: [],
    level: 3,
    nextLevelXp: 4000,
    currentLevelXp: 3800,
    progress: 95,
  },
  {
    _id: "9",
    user: {
      _id: "9",
      name: "Daniel Taylor",
      role: "Analyst",
      department: "Data",
    },
    points: 600,
    xp: 3200,
    rank: 9,
    completedCourses: 3,
    completedChallenges: 1,
    badges: [],
    streak: 1,
    lastActive: "2025-07-23T14:15:00Z",
    achievements: [],
    level: 3,
    nextLevelXp: 4000,
    currentLevelXp: 3200,
    progress: 80,
  },
  {
    _id: "10",
    user: {
      _id: "10",
      name: "Sophia Anderson",
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
      role: "Developer",
      department: "Engineering",
    },
    points: 550,
    xp: 2800,
    rank: 10,
    completedCourses: 2,
    completedChallenges: 1,
    badges: [],
    streak: 1,
    lastActive: "2025-07-23T10:05:00Z",
    achievements: [],
    level: 2,
    nextLevelXp: 3000,
    currentLevelXp: 2800,
    progress: 93.3,
  },
];

const dummyStats: LeaderboardStats = {
  totalParticipants: 42,
  averagePoints: 450,
  topScore: 1250,
  activeUsers: 28,
  totalXp: 125000,
  averageLevel: 3.5,
  topStreak: 15,
  recentActivity: [
    {
      type: "course",
      user: "Alex Johnson",
      points: 50,
      timestamp: "2025-07-27T10:30:00Z",
    },
    {
      type: "challenge",
      user: "Sarah Williams",
      points: 100,
      timestamp: "2025-07-27T09:15:00Z",
    },
    {
      type: "course",
      user: "Michael Brown",
      points: 25,
      timestamp: "2025-07-26T14:45:00Z",
    },
  ],
  distribution: [
    { level: 1, count: 5 },
    { level: 2, count: 8 },
    { level: 3, count: 12 },
    { level: 4, count: 9 },
    { level: 5, count: 5 },
    { level: 6, count: 2 },
    { level: 7, count: 1 },
    { level: 8, count: 0 },
  ],
};

export default function LeaderboardScreen() {
  const { colors } = useTheme();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>(dummyStats);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState("all");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(
    null
  );
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Hardcoded user id for highlighting
  const currentUserId = "1";

  const fetchLeaderboard = useCallback(async () => {
    try {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setEntries(dummyEntries);
      setStats(dummyStats);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getBadgeIcon = (badge: string) => {
    const badgeIcons: Record<string, any> = {
      medal: "medal",
      trophy: "trophy",
      star: "star",
      certificate: "certificate",
    };
    return badgeIcons[badge] || "star";
  };

  const renderTopThree = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles(colors).topThreeScroll}
      contentContainerStyle={styles(colors).topThreeScrollContent}
    >
      {entries.slice(0, 3).map((entry, idx) => (
        <TouchableOpacity
          key={entry._id}
          onPress={() => {
            setSelectedUser(entry);
            setShowUserModal(true);
          }}
          style={[
            styles(colors).topThreeCard,
            idx === 0 && styles(colors).firstPlace,
            idx === 1 && styles(colors).secondPlace,
            idx === 2 && styles(colors).thirdPlace,
          ]}
        >
          <View
            style={[
              styles(colors).rankBadge,
              idx === 0 && styles(colors).firstPlaceBadge,
              idx === 1 && styles(colors).secondPlaceBadge,
              idx === 2 && styles(colors).thirdPlaceBadge,
            ]}
          >
            <Text style={styles(colors).rankNumber}>{idx + 1}</Text>
          </View>
          {entry.user.avatar ? (
            <Avatar.Image
              size={60 + (idx === 0 ? 16 : 0)}
              source={{ uri: entry.user.avatar }}
            />
          ) : (
            <DefaultAvatar size={60 + (idx === 0 ? 16 : 0)} />
          )}
          {idx === 0 && (
            <View style={styles(colors).crownIcon}>
              <MaterialCommunityIcons name="crown" size={24} color={colors.warning} />
            </View>
          )}
          <Text style={styles(colors).userName}>{entry.user.name}</Text>
          <Text style={styles(colors).userPoints}>{entry.points} points</Text>
          <View style={styles(colors).levelContainer}>
            <Text style={styles(colors).levelText}>Level {entry.level}</Text>
            <ProgressBar
              progress={entry.currentLevelXp / entry.nextLevelXp}
              color={colors.primary}
              style={styles(colors).levelProgress}
            />
          </View>
          <View style={styles(colors).badgesContainer}>
            {entry.badges.slice(0, 3).map((badge, i) => (
              <MaterialCommunityIcons
                key={i}
                name={getBadgeIcon(badge)}
                size={18}
                color={colors.primary}
              />
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFilters = () => (
    <View style={styles(colors).filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles(colors).filtersScrollContainer}
        contentContainerStyle={styles(colors).filtersContentContainer}
      >
        <View style={styles(colors).filterGroup}>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              timeFrame === "all" && styles(colors).activeFilter,
            ]}
            onPress={() => setTimeFrame("all")}
          >
            <Text
              style={[
                styles(colors).filterText,
                timeFrame === "all" && styles(colors).activeFilterText,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              timeFrame === "week" && styles(colors).activeFilter,
            ]}
            onPress={() => setTimeFrame("week")}
          >
            <Text
              style={[
                styles(colors).filterText,
                timeFrame === "week" && styles(colors).activeFilterText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              timeFrame === "month" && styles(colors).activeFilter,
            ]}
            onPress={() => setTimeFrame("month")}
          >
            <Text
              style={[
                styles(colors).filterText,
                timeFrame === "month" && styles(colors).activeFilterText,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles(colors).filterDivider} />

        <View style={styles(colors).filterGroup}>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              category === "all" && styles(colors).activeFilter,
            ]}
            onPress={() => setCategory("all")}
          >
            <Text
              style={[
                styles(colors).filterText,
                category === "all" && styles(colors).activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              category === "engineering" && styles(colors).activeFilter,
            ]}
            onPress={() => setCategory("engineering")}
          >
            <Text
              style={[
                styles(colors).filterText,
                category === "engineering" && styles(colors).activeFilterText,
              ]}
            >
              Engineering
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              category === "sales" && styles(colors).activeFilter,
            ]}
            onPress={() => setCategory("sales")}
          >
            <Text
              style={[
                styles(colors).filterText,
                category === "sales" && styles(colors).activeFilterText,
              ]}
            >
              Sales
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).filterButton,
              category === "marketing" && styles(colors).activeFilter,
            ]}
            onPress={() => setCategory("marketing")}
          >
            <Text
              style={[
                styles(colors).filterText,
                category === "marketing" && styles(colors).activeFilterText,
              ]}
            >
              Marketing
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => (
    <TouchableOpacity
      key={entry._id}
      onPress={() => {
        setSelectedUser(entry);
        setShowUserModal(true);
      }}
    >
      <Card
        style={[
          styles(colors).entryCard,
          entry.user._id === currentUserId && styles(colors).currentUserCard,
        ]}
      >
        <Card.Content style={styles(colors).entryContent}>
          <View style={styles(colors).rankContainerRow}>
            <Text style={[styles(colors).rankText, index < 3 && styles(colors).topRankText]}>
              #{index + 1}
            </Text>
          </View>

          <View style={styles(colors).userInfoRow}>
            {entry.user.avatar ? (
              <Avatar.Image size={48} source={{ uri: entry.user.avatar }} />
            ) : (
              <DefaultAvatar size={48} />
            )}
            <View style={styles(colors).userDetailsRow}>
              <Text style={styles(colors).userName}>{entry.user.name}</Text>
              <View style={styles(colors).userMetaRow}>
                <Text style={styles(colors).userRole}>{entry.user.role}</Text>
                {entry.user.department && (
                  <Text style={styles(colors).userDepartment}>
                    • {entry.user.department}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles(colors).statsContainerRow}>
            <View style={styles(colors).statRow}>
              <MaterialCommunityIcons name="star" size={16} color={colors.primary} />
              <Text style={styles(colors).statText}>{entry.points}</Text>
            </View>
            <View style={styles(colors).statRow}>
              <MaterialCommunityIcons name="trophy" size={16} color={colors.primary} />
              <Text style={styles(colors).statText}>{entry.xp}</Text>
            </View>
            <View style={styles(colors).statRow}>
              <MaterialCommunityIcons
                name="book-check"
                size={16}
                color={colors.primary}
              />
              <Text style={styles(colors).statText}>{entry.completedCourses}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderUserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      onRequestClose={() => setShowUserModal(false)}
    >
      <View style={styles(colors).modalContainer}>
        {selectedUser && (
          <>
            <View style={styles(colors).modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowUserModal(false)}
                style={styles(colors).closeButton}
              />
              <Text style={styles(colors).modalTitle}>User Profile</Text>
            </View>

            <ScrollView style={styles(colors).modalContent}>
              <View style={styles(colors).userProfileHeader}>
                {selectedUser.user.avatar ? (
                  <Avatar.Image
                    size={120}
                    source={{ uri: selectedUser.user.avatar }}
                    style={styles(colors).profileAvatar}
                  />
                ) : (
                  <DefaultAvatar size={120} style={styles(colors).profileAvatar} />
                )}

                <Text style={styles(colors).profileName}>{selectedUser.user.name}</Text>
                <Text style={styles(colors).profileRole}>{selectedUser.user.role}</Text>
                {selectedUser.user.department && (
                  <Text style={styles(colors).profileDepartment}>
                    {selectedUser.user.department}
                  </Text>
                )}

                <View style={styles(colors).profileRank}>
                  <MaterialCommunityIcons
                    name="numeric-1-circle"
                    size={24}
                    color={colors.warning}
                  />
                  <Text style={styles(colors).profileRankText}>
                    Rank #{selectedUser.rank}
                  </Text>
                </View>
              </View>

              <Card style={styles(colors).profileCard}>
                <Card.Content>
                  <View style={styles(colors).statsGrid}>
                    <View style={styles(colors).statItem}>
                      <Text style={styles(colors).statLabel}>Points</Text>
                      <Text style={styles(colors).statValue}>
                        {selectedUser.points}
                      </Text>
                    </View>
                    <View style={styles(colors).statItem}>
                      <Text style={styles(colors).statLabel}>Total XP</Text>
                      <Text style={styles(colors).statValue}>{selectedUser.xp}</Text>
                    </View>
                    <View style={styles(colors).statItem}>
                      <Text style={styles(colors).statLabel}>Courses</Text>
                      <Text style={styles(colors).statValue}>
                        {selectedUser.completedCourses}
                      </Text>
                    </View>
                    <View style={styles(colors).statItem}>
                      <Text style={styles(colors).statLabel}>Challenges</Text>
                      <Text style={styles(colors).statValue}>
                        {selectedUser.completedChallenges}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles(colors).profileCard}>
                <Card.Content>
                  <Text style={styles(colors).sectionTitle}>Level Progress</Text>
                  <View style={styles(colors).levelProgressContainer}>
                    <Text style={styles(colors).levelText}>
                      Level {selectedUser.level}
                    </Text>
                    <ProgressBar
                      progress={
                        selectedUser.currentLevelXp / selectedUser.nextLevelXp
                      }
                      color={colors.primary}
                      style={styles(colors).levelProgressBar}
                    />
                    <Text style={styles(colors).xpText}>
                      {selectedUser.currentLevelXp} / {selectedUser.nextLevelXp} XP
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {selectedUser.badges.length > 0 && (
                <Card style={styles(colors).profileCard}>
                  <Card.Content>
                    <Text style={styles(colors).sectionTitle}>Badges</Text>
                    <View style={styles(colors).badgesGrid}>
                      {selectedUser.badges.map((badge, index) => (
                        <View key={index} style={styles(colors).badgeItem}>
                          <MaterialCommunityIcons
                            name={getBadgeIcon(badge)}
                            size={36}
                            color={colors.primary}
                          />
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              )}

              {selectedUser.achievements.length > 0 && (
                <Card style={styles(colors).profileCard}>
                  <Card.Content>
                    <Text style={styles(colors).sectionTitle}>Achievements</Text>
                    {selectedUser.achievements.map((achievement, index) => (
                      <View key={index} style={styles(colors).achievementItem}>
                        <MaterialCommunityIcons
                          name={achievement.icon as any}
                          size={24}
                          color={colors.primary}
                          style={styles(colors).achievementIcon}
                        />
                        <View style={styles(colors).achievementDetails}>
                          <Text style={styles(colors).achievementName}>
                            {achievement.name}
                          </Text>
                          <Text style={styles(colors).achievementDescription}>
                            {achievement.description}
                          </Text>
                          <Text style={styles(colors).achievementDate}>
                            Unlocked:{" "}
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );

  const renderStatsModal = () => (
    <Modal
      visible={showStatsModal}
      animationType="slide"
      onRequestClose={() => setShowStatsModal(false)}
    >
      <View style={styles(colors).modalContainer}>
        <View style={styles(colors).modalHeader}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowStatsModal(false)}
            style={styles(colors).closeButton}
          />
          <Text style={styles(colors).modalTitle}>Leaderboard Statistics</Text>
        </View>

        <ScrollView style={styles(colors).modalContent}>
          <Card style={styles(colors).profileCard}>
            <Card.Content>
              <Text style={styles(colors).sectionTitle}>General Stats</Text>
              <View style={styles(colors).statsGrid}>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Total Participants</Text>
                  <Text style={styles(colors).statValue}>
                    {stats.totalParticipants}
                  </Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Average Points</Text>
                  <Text style={styles(colors).statValue}>{stats.averagePoints}</Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Top Score</Text>
                  <Text style={styles(colors).statValue}>{stats.topScore}</Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Active Users</Text>
                  <Text style={styles(colors).statValue}>{stats.activeUsers}</Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Total XP</Text>
                  <Text style={styles(colors).statValue}>{stats.totalXp}</Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Average Level</Text>
                  <Text style={styles(colors).statValue}>{stats.averageLevel}</Text>
                </View>
                <View style={styles(colors).statItem}>
                  <Text style={styles(colors).statLabel}>Top Streak</Text>
                  <Text style={styles(colors).statValue}>{stats.topStreak}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles(colors).profileCard}>
            <Card.Content>
              <Text style={styles(colors).sectionTitle}>Level Distribution</Text>
              <View style={styles(colors).chartContainer}>
                {stats.distribution.map((item, index) => (
                  <View key={index} style={styles(colors).chartItem}>
                    <Text style={styles(colors).chartLabel}>Lvl {item.level}</Text>
                    <View style={styles(colors).chartBarContainer}>
                      <View
                        style={[
                          styles(colors).chartBar,
                          {
                            width: `${
                              (item.count /
                                Math.max(
                                  ...stats.distribution.map((d) => d.count)
                                )) *
                              100
                            }%`,
                            backgroundColor: index % 2 === 0 ? colors.primary : colors.info,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles(colors).chartValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {stats.recentActivity.length > 0 && (
            <Card style={styles(colors).profileCard}>
              <Card.Content>
                <Text style={styles(colors).sectionTitle}>Recent Activity</Text>
                {stats.recentActivity.map((activity, index) => (
                  <View key={index} style={styles(colors).activityItem}>
                    <MaterialCommunityIcons
                      name={activity.type === "course" ? "book" : "sword-cross"}
                      size={20}
                      color={colors.textSecondary}
                    />
                    <Text style={styles(colors).activityText}>
                      <Text style={styles(colors).activityUser}>{activity.user}</Text>{" "}
                      earned {activity.points} points for completing a{" "}
                      {activity.type}
                    </Text>
                    <Text style={styles(colors).activityTime}>
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  const filteredEntries = entries.filter(
    (entry) =>
      entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.user.department &&
        entry.user.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles(colors).loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles(colors).container}>
      <Text style={styles(colors).header}>Leaderboard</Text>
      <View style={styles(colors).actionsContainer}>
        <TouchableOpacity
          style={styles(colors).statsButton}
          onPress={() => setShowStatsModal(true)}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={20}
            color={colors.text}
          />
          <Text style={styles(colors).statsButtonText}>View Stats</Text>
        </TouchableOpacity>

        <View style={styles(colors).viewToggle}>
          <TouchableOpacity
            style={[
              styles(colors).viewToggleButton,
              viewMode === "grid" && styles(colors).activeViewToggle,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <MaterialCommunityIcons
              name="view-grid"
              size={20}
              color={viewMode === "grid" ? colors.text : colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles(colors).viewToggleButton,
              viewMode === "list" && styles(colors).activeViewToggle,
            ]}
            onPress={() => setViewMode("list")}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={viewMode === "list" ? colors.text : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilters()}
      <View style={styles(colors).filterDividerLine} />

      <ScrollView
        style={styles(colors).leaderboardContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchLeaderboard}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {renderTopThree()}
        <View style={styles(colors).entriesContainer}>
          {filteredEntries
            .slice(3)
            .map((entry, index) => renderLeaderboardEntry(entry, index + 3))}
        </View>
      </ScrollView>

      {renderUserModal()}
      {renderStatsModal()}
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 16,
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.cardBackground,
    marginTop: -10,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    marginBottom: 0,
  },
  statsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: `${colors.primary}26`, // ~0.15 opacity
  },
  statsButtonText: {
    color: colors.text,
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: `${colors.primary}26`, // ~0.15 opacity
    borderRadius: 10,
    overflow: "hidden",
  },
  viewToggleButton: {
    padding: 10,
  },
  activeViewToggle: {
    backgroundColor: `${colors.primary}40`, // ~0.25 opacity
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: colors.cardBackground,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filtersScrollContainer: {
    flexGrow: 0,
  },
  filtersContentContainer: {
    paddingHorizontal: 8,
    alignItems: "center",
  },
  filterGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    height: 32,
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  activeFilterText: {
    color: colors.onPrimary,
    fontWeight: "bold",
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.borderColor,
    marginRight: 8,
  },
  filterDividerLine: {
    height: 1,
    backgroundColor: colors.borderColor,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  leaderboardContainer: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topThreeScroll: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topThreeScrollContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  topThreeCard: {
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderColor,
    width: 180,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  firstPlace: {
    height: 300,
    marginBottom: -20,
    borderColor: colors.warning,
    borderWidth: 2,
    elevation: 4,
  },
  secondPlace: {
    height: 260,
  },
  thirdPlace: {
    height: 240,
  },
  rankBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  firstPlaceBadge: {
    backgroundColor: colors.warning,
  },
  secondPlaceBadge: {
    backgroundColor: colors.textSecondary,
  },
  thirdPlaceBadge: {
    backgroundColor: "#CD7F32", // Bronze
  },
  rankNumber: {
    color: colors.onPrimary,
    fontWeight: "bold",
    fontSize: 16,
  },
  crownIcon: {
    position: "absolute",
    top: -15,
    zIndex: 1,
  },
  userName: {
    color: colors.text,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
    fontSize: 18,
  },
  userPoints: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 14,
  },
  levelContainer: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  levelText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  levelProgress: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: `${colors.primary}1A`, // ~0.1 opacity
  },
  badgesContainer: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  entriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  entryCard: {
    backgroundColor: colors.cardBackground,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  currentUserCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    elevation: 3,
  },
  entryContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 28,
    paddingHorizontal: 20,
    gap: 20,
  },
  rankContainerRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18,
  },
  userDetailsRow: {
    marginLeft: 24,
    flex: 1,
  },
  userMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
  },
  statsContainerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    gap: 32,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32,
  },
  rankText: {
    color: colors.textSecondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  topRankText: {
    color: colors.warning,
  },
  userRole: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  userDepartment: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  statText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
    backgroundColor: colors.primary,
  },
  closeButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.onPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  userProfileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileAvatar: {
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  profileDepartment: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  profileRank: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  profileRankText: {
    color: colors.text,
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    marginBottom: 16,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  levelProgressContainer: {
    marginBottom: 16,
  },
  levelProgressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.primary}1A`, // ~0.1 opacity
    marginVertical: 8,
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  badgeItem: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
    backgroundColor: `${colors.primary}1A`, // ~0.1 opacity
    borderRadius: 30,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  achievementIcon: {
    marginRight: 12,
    marginTop: 4,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementName: {
    color: colors.text,
    fontWeight: "bold",
    marginBottom: 4,
  },
  achievementDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
  },
  chartContainer: {
    marginTop: 16,
  },
  chartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  chartLabel: {
    color: colors.textSecondary,
    width: 50,
    fontSize: 12,
  },
  chartBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: `${colors.primary}1A`, // ~0.1 opacity
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  chartBar: {
    height: "100%",
    borderRadius: 8,
  },
  chartValue: {
    color: colors.text,
    width: 30,
    textAlign: "right",
    fontSize: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  activityText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  activityUser: {
    color: colors.text,
    fontWeight: "bold",
  },
  activityTime: {
    color: colors.textSecondary,
    fontSize: 12,
    width: "100%",
    marginLeft: 28,
    marginTop: 4,
  },
});