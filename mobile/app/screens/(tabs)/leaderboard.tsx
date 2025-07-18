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
// Removed: import { useTourLMS } from "../../../contexts/TourLMSContext";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import {
  BACKGROUND,
  BORDER_COLOR,
  CARD_BACKGROUND,
  INFO,
  PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WARNING,
} from "../../constants/colors";
import { useToast } from "../../hooks/use-toast";

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
    lastActive: "2023-05-15T10:30:00Z",
    achievements: [
      {
        name: "Course Master",
        icon: "book",
        description: "Completed 10 courses",
        unlockedAt: "2023-04-20",
      },
      {
        name: "Streak Champion",
        icon: "fire",
        description: "7-day activity streak",
        unlockedAt: "2023-05-10",
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
    lastActive: "2023-05-15T09:15:00Z",
    achievements: [
      {
        name: "Quick Learner",
        icon: "lightning-bolt",
        description: "Completed 5 courses in one week",
        unlockedAt: "2023-04-15",
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
    lastActive: "2023-05-14T14:45:00Z",
    achievements: [
      {
        name: "Creative Mind",
        icon: "palette",
        description: "Completed all design courses",
        unlockedAt: "2023-03-28",
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
    lastActive: "2023-05-14T11:20:00Z",
    achievements: [
      {
        name: "Data Wizard",
        icon: "chart-bar",
        description: "Completed all analytics courses",
        unlockedAt: "2023-04-05",
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
    lastActive: "2023-05-13T16:10:00Z",
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
    lastActive: "2023-05-13T10:45:00Z",
    achievements: [
      {
        name: "Marketing Guru",
        icon: "bullhorn",
        description: "Completed all marketing courses",
        unlockedAt: "2023-03-15",
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
    lastActive: "2023-05-12T15:30:00Z",
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
    lastActive: "2023-05-12T09:20:00Z",
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
    lastActive: "2023-05-11T14:15:00Z",
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
    lastActive: "2023-05-11T10:05:00Z",
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
      timestamp: "2023-05-15T10:30:00Z",
    },
    {
      type: "challenge",
      user: "Sarah Williams",
      points: 100,
      timestamp: "2023-05-15T09:15:00Z",
    },
    {
      type: "course",
      user: "Michael Brown",
      points: 25,
      timestamp: "2023-05-14T14:45:00Z",
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
  // Removed: const { user } = useTourLMS();
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

  // For highlighting current user, use a hardcoded user id (e.g., "1")
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
      style={styles.topThreeScroll}
      contentContainerStyle={styles.topThreeScrollContent}
    >
      {entries.slice(0, 3).map((entry, idx) => (
        <TouchableOpacity
          key={entry._id}
          onPress={() => {
            setSelectedUser(entry);
            setShowUserModal(true);
          }}
          style={[
            styles.topThreeCard,
            idx === 0 && styles.firstPlace,
            idx === 1 && styles.secondPlace,
            idx === 2 && styles.thirdPlace,
          ]}
        >
          <View
            style={[
              styles.rankBadge,
              idx === 0 && styles.firstPlaceBadge,
              idx === 1 && styles.secondPlaceBadge,
              idx === 2 && styles.thirdPlaceBadge,
            ]}
          >
            <Text style={styles.rankNumber}>{idx + 1}</Text>
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
            <View style={styles.crownIcon}>
              <MaterialCommunityIcons name="crown" size={24} color={WARNING} />
            </View>
          )}
          <Text style={styles.userName}>{entry.user.name}</Text>
          <Text style={styles.userPoints}>{entry.points} points</Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {entry.level}</Text>
            <ProgressBar
              progress={entry.currentLevelXp / entry.nextLevelXp}
              color={PRIMARY}
              style={styles.levelProgress}
            />
          </View>
          <View style={styles.badgesContainer}>
            {entry.badges.slice(0, 3).map((badge, i) => (
              <MaterialCommunityIcons
                key={i}
                name={getBadgeIcon(badge)}
                size={18}
                color={PRIMARY}
              />
            ))}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Move renderFilters here so styles is in scope
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScrollContainer}
        contentContainerStyle={styles.filtersContentContainer}
      >
        <View style={styles.filterGroup}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "all" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("all")}
          >
            <Text
              style={[
                styles.filterText,
                timeFrame === "all" && styles.activeFilterText,
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "week" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("week")}
          >
            <Text
              style={[
                styles.filterText,
                timeFrame === "week" && styles.activeFilterText,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timeFrame === "month" && styles.activeFilter,
            ]}
            onPress={() => setTimeFrame("month")}
          >
            <Text
              style={[
                styles.filterText,
                timeFrame === "month" && styles.activeFilterText,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterDivider} />

        <View style={styles.filterGroup}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              category === "all" && styles.activeFilter,
            ]}
            onPress={() => setCategory("all")}
          >
            <Text
              style={[
                styles.filterText,
                category === "all" && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              category === "engineering" && styles.activeFilter,
            ]}
            onPress={() => setCategory("engineering")}
          >
            <Text
              style={[
                styles.filterText,
                category === "engineering" && styles.activeFilterText,
              ]}
            >
              Engineering
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              category === "sales" && styles.activeFilter,
            ]}
            onPress={() => setCategory("sales")}
          >
            <Text
              style={[
                styles.filterText,
                category === "sales" && styles.activeFilterText,
              ]}
            >
              Sales
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              category === "marketing" && styles.activeFilter,
            ]}
            onPress={() => setCategory("marketing")}
          >
            <Text
              style={[
                styles.filterText,
                category === "marketing" && styles.activeFilterText,
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
          styles.entryCard,
          entry.user._id === currentUserId && styles.currentUserCard,
        ]}
      >
        <Card.Content style={styles.entryContent}>
          <View style={styles.rankContainerRow}>
            <Text style={[styles.rankText, index < 3 && styles.topRankText]}>
              #{index + 1}
            </Text>
          </View>

          <View style={styles.userInfoRow}>
            {entry.user.avatar ? (
              <Avatar.Image size={48} source={{ uri: entry.user.avatar }} />
            ) : (
              <DefaultAvatar size={48} />
            )}
            <View style={styles.userDetailsRow}>
              <Text style={styles.userName}>{entry.user.name}</Text>
              <View style={styles.userMetaRow}>
                <Text style={styles.userRole}>{entry.user.role}</Text>
                {entry.user.department && (
                  <Text style={styles.userDepartment}>
                    • {entry.user.department}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statsContainerRow}>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="star" size={16} color={PRIMARY} />
              <Text style={styles.statText}>{entry.points}</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons name="trophy" size={16} color={PRIMARY} />
              <Text style={styles.statText}>{entry.xp}</Text>
            </View>
            <View style={styles.statRow}>
              <MaterialCommunityIcons
                name="book-check"
                size={16}
                color={PRIMARY}
              />
              <Text style={styles.statText}>{entry.completedCourses}</Text>
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
      <View style={styles.modalContainer}>
        {selectedUser && (
          <>
            <View style={styles.modalHeader}>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowUserModal(false)}
                style={styles.closeButton}
              />
              <Text style={styles.modalTitle}>User Profile</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.userProfileHeader}>
                {selectedUser.user.avatar ? (
                  <Avatar.Image
                    size={120}
                    source={{ uri: selectedUser.user.avatar }}
                    style={styles.profileAvatar}
                  />
                ) : (
                  <DefaultAvatar size={120} style={styles.profileAvatar} />
                )}

                <Text style={styles.profileName}>{selectedUser.user.name}</Text>
                <Text style={styles.profileRole}>{selectedUser.user.role}</Text>
                {selectedUser.user.department && (
                  <Text style={styles.profileDepartment}>
                    {selectedUser.user.department}
                  </Text>
                )}

                <View style={styles.profileRank}>
                  <MaterialCommunityIcons
                    name="numeric-1-circle"
                    size={24}
                    color={WARNING}
                  />
                  <Text style={styles.profileRankText}>
                    Rank #{selectedUser.rank}
                  </Text>
                </View>
              </View>

              <Card style={styles.profileCard}>
                <Card.Content>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Points</Text>
                      <Text style={styles.statValue}>
                        {selectedUser.points}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Total XP</Text>
                      <Text style={styles.statValue}>{selectedUser.xp}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Courses</Text>
                      <Text style={styles.statValue}>
                        {selectedUser.completedCourses}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Challenges</Text>
                      <Text style={styles.statValue}>
                        {selectedUser.completedChallenges}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.profileCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Level Progress</Text>
                  <View style={styles.levelProgressContainer}>
                    <Text style={styles.levelText}>
                      Level {selectedUser.level}
                    </Text>
                    <ProgressBar
                      progress={
                        selectedUser.currentLevelXp / selectedUser.nextLevelXp
                      }
                      color={PRIMARY}
                      style={styles.levelProgressBar}
                    />
                    <Text style={styles.xpText}>
                      {selectedUser.currentLevelXp} / {selectedUser.nextLevelXp}{" "}
                      XP
                    </Text>
                  </View>
                </Card.Content>
              </Card>

              {selectedUser.badges.length > 0 && (
                <Card style={styles.profileCard}>
                  <Card.Content>
                    <Text style={styles.sectionTitle}>Badges</Text>
                    <View style={styles.badgesGrid}>
                      {selectedUser.badges.map((badge, index) => (
                        <View key={index} style={styles.badgeItem}>
                          <MaterialCommunityIcons
                            name={getBadgeIcon(badge)}
                            size={36}
                            color={PRIMARY}
                          />
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              )}

              {selectedUser.achievements.length > 0 && (
                <Card style={styles.profileCard}>
                  <Card.Content>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    {selectedUser.achievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementItem}>
                        <MaterialCommunityIcons
                          name={achievement.icon as any}
                          size={24}
                          color={PRIMARY}
                          style={styles.achievementIcon}
                        />
                        <View style={styles.achievementDetails}>
                          <Text style={styles.achievementName}>
                            {achievement.name}
                          </Text>
                          <Text style={styles.achievementDescription}>
                            {achievement.description}
                          </Text>
                          <Text style={styles.achievementDate}>
                            Unlocked:{" "}
                            {new Date(
                              achievement.unlockedAt
                            ).toLocaleDateString()}
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
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <IconButton
            icon="close"
            size={24}
            onPress={() => setShowStatsModal(false)}
            style={styles.closeButton}
          />
          <Text style={styles.modalTitle}>Leaderboard Statistics</Text>
        </View>

        <ScrollView style={styles.modalContent}>
          <Card style={styles.profileCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>General Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Participants</Text>
                  <Text style={styles.statValue}>
                    {stats.totalParticipants}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average Points</Text>
                  <Text style={styles.statValue}>{stats.averagePoints}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Top Score</Text>
                  <Text style={styles.statValue}>{stats.topScore}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Active Users</Text>
                  <Text style={styles.statValue}>{stats.activeUsers}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total XP</Text>
                  <Text style={styles.statValue}>{stats.totalXp}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Average Level</Text>
                  <Text style={styles.statValue}>{stats.averageLevel}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Top Streak</Text>
                  <Text style={styles.statValue}>{stats.topStreak}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.profileCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Level Distribution</Text>
              <View style={styles.chartContainer}>
                {stats.distribution.map((item, index) => (
                  <View key={index} style={styles.chartItem}>
                    <Text style={styles.chartLabel}>Lvl {item.level}</Text>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            width: `${
                              (item.count /
                                Math.max(
                                  ...stats.distribution.map((d) => d.count)
                                )) *
                              100
                            }%`,
                            backgroundColor: index % 2 === 0 ? PRIMARY : INFO,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartValue}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {stats.recentActivity.length > 0 && (
            <Card style={styles.profileCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {stats.recentActivity.map((activity, index) => (
                  <View key={index} style={styles.activityItem}>
                    <MaterialCommunityIcons
                      name={activity.type === "course" ? "book" : "sword-cross"}
                      size={20}
                      color={TEXT_SECONDARY}
                    />
                    <Text style={styles.activityText}>
                      <Text style={styles.activityUser}>{activity.user}</Text>{" "}
                      earned {activity.points} points for completing a{" "}
                      {activity.type}
                    </Text>
                    <Text style={styles.activityTime}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>Leaderboard</ThemedText>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => setShowStatsModal(true)}
        >
          <MaterialCommunityIcons
            name="chart-bar"
            size={20}
            color={TEXT_PRIMARY}
          />
          <Text style={styles.statsButtonText}>View Stats</Text>
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "grid" && styles.activeViewToggle,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <MaterialCommunityIcons
              name="view-grid"
              size={20}
              color={viewMode === "grid" ? TEXT_PRIMARY : TEXT_SECONDARY}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewMode === "list" && styles.activeViewToggle,
            ]}
            onPress={() => setViewMode("list")}
          >
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={viewMode === "list" ? TEXT_PRIMARY : TEXT_SECONDARY}
            />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilters()}
      <View style={styles.filterDividerLine} />

      {/* Make the whole content below vertically scrollable */}
      <ScrollView
        style={styles.leaderboardContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchLeaderboard}
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Top 3 Section */}
        {renderTopThree()}
        {/* Scrollable list for the rest */}
        <View style={styles.entriesContainer}>
          {filteredEntries
            .slice(3)
            .map((entry, index) => renderLeaderboardEntry(entry, index + 3))}
        </View>
      </ScrollView>

      {renderUserModal()}
      {renderStatsModal()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: TEXT_PRIMARY,
    marginBottom: 0,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CARD_BACKGROUND,
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
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  statsButtonText: {
    color: TEXT_PRIMARY,
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 15,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    overflow: "hidden",
  },
  viewToggleButton: {
    padding: 10,
  },
  activeViewToggle: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  searchBar: {
    backgroundColor: CARD_BACKGROUND,
    elevation: 2,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  searchInput: {
    color: TEXT_PRIMARY,
    fontSize: 16,
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: CARD_BACKGROUND,
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
  filterGroupLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: "center",
    alignItems: "center",
    height: 32,
  },
  activeFilter: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  activeFilterText: {
    color: TEXT_PRIMARY,
    fontWeight: "bold",
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER_COLOR,
    marginRight: 8,
  },
  filterDividerLine: {
    height: 1,
    backgroundColor: BORDER_COLOR,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  leaderboardContainer: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topThreeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topThreeScroll: {
    padding: 16,
    backgroundColor: CARD_BACKGROUND,
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
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
    borderColor: WARNING,
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
    backgroundColor: PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  firstPlaceBadge: {
    backgroundColor: WARNING,
  },
  secondPlaceBadge: {
    backgroundColor: TEXT_SECONDARY,
  },
  thirdPlaceBadge: {
    backgroundColor: "#CD7F32",
  },
  rankNumber: {
    color: TEXT_PRIMARY,
    fontWeight: "bold",
    fontSize: 16,
  },
  crownIcon: {
    position: "absolute",
    top: -15,
    zIndex: 1,
  },
  userName: {
    color: TEXT_PRIMARY,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
    fontSize: 18, // increased font size
  },
  userPoints: {
    color: TEXT_SECONDARY,
    marginTop: 4,
    fontSize: 14,
  },
  levelContainer: {
    width: "100%",
    marginTop: 8,
    alignItems: "center",
  },
  levelText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 4,
  },
  levelProgress: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: CARD_BACKGROUND,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  currentUserCard: {
    borderColor: PRIMARY,
    borderWidth: 2,
    elevation: 3,
  },
  entryContent: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 28, // further increased padding
    paddingHorizontal: 20, // further increased padding
    gap: 20, // further increased vertical gap between sections
  },
  rankContainerRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 18, // more space below rank
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 18, // more space below user info
  },
  userDetailsRow: {
    marginLeft: 24, // more space between avatar and details
    flex: 1,
  },
  userMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4, // add space above meta
  },
  statsContainerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    marginTop: 16, // more space above stats
    gap: 32, // more space between stats
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 32, // more space between stat items
  },
  rankText: {
    color: TEXT_SECONDARY,
    fontWeight: "bold",
    fontSize: 16,
  },
  topRankText: {
    color: WARNING,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  userDetails: {
    marginLeft: 12,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  userRole: {
    color: TEXT_SECONDARY,
    fontSize: 14, // increased font size
  },
  userDepartment: {
    color: TEXT_SECONDARY,
    fontSize: 14, // increased font size
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    marginLeft: 16,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    color: TEXT_SECONDARY,
    marginLeft: 8, // more space between icon and text
    fontSize: 16, // increased font size
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 48,
    backgroundColor: PRIMARY,
  },
  closeButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: TEXT_PRIMARY,
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
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    marginBottom: 4,
  },
  profileDepartment: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  profileRank: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  profileRankText: {
    color: TEXT_PRIMARY,
    fontWeight: "bold",
    marginLeft: 8,
  },
  profileCard: {
    backgroundColor: CARD_BACKGROUND,
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
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  xpText: {
    color: TEXT_SECONDARY,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    color: TEXT_PRIMARY,
    fontWeight: "bold",
    marginBottom: 4,
  },
  achievementDescription: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    color: TEXT_SECONDARY,
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
    color: TEXT_SECONDARY,
    width: 50,
    fontSize: 12,
  },
  chartBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  chartBar: {
    height: "100%",
    borderRadius: 8,
  },
  chartValue: {
    color: TEXT_PRIMARY,
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
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  activityUser: {
    color: TEXT_PRIMARY,
    fontWeight: "bold",
  },
  activityTime: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    width: "100%",
    marginLeft: 28,
    marginTop: 4,
  },
});
