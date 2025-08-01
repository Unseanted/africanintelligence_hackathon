import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Searchbar, Text } from "react-native-paper";
import { useTheme } from '../../contexts/ThemeContext';
import { useTourLMS } from '../../contexts/TourLMSContext';

export default function ForumScreen() {
  const { colors } = useTheme();
  const { user } = useTourLMS();

  interface Category {
    id: string;
    name: string;
    icon?: string;
    count?: number;
  }

  interface Comment {
    id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    likes: string[];
  }

  interface Post {
    _id: string;
    title: string;
    content: string;
    author: {
      _id: string;
      name: string;
      avatar?: string;
    };
    createdAt: string;
    likes: string[];
    comments: Comment[];
    views: number;
    category: string;
    tags: string[];
    isPinned?: boolean;
    isFeatured?: boolean;
    reposts?: string[];
    challengeId?: string;
  }

  interface ForumStats {
    totalTopics: number;
    totalPosts: number;
    activeUsers: number;
    onlineNow: number;
    newToday: number;
  }

  interface Challenge {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    badge: string;
    participants: string[];
    posts: string[];
    isActive: boolean;
  }

  const HARDCODED_CATEGORIES: Category[] = [
    { id: "general", name: "General Discussion", icon: "forum", count: 42 },
    { id: "questions", name: "Questions", icon: "help-circle", count: 28 },
    { id: "announcements", name: "Announcements", icon: "bullhorn", count: 15 },
    { id: "feedback", name: "Feedback", icon: "message-alert", count: 23 },
    { id: "ideas", name: "Ideas", icon: "lightbulb-on", count: 17 },
    { id: "challenges", name: "Challenges", icon: "trophy", count: 9 },
  ];

  const HARDCODED_CHALLENGES: Challenge[] = [
    {
      id: "challenge1",
      title: "Complete 5 Courses",
      description: "Complete any 5 courses this month to earn a special badge!",
      startDate: "2025-07-01T00:00:00Z",
      endDate: "2025-07-31T23:59:59Z",
      badge: "📚",
      participants: ["user1", "user3", "user5", "user9"],
      posts: ["4", "6"],
      isActive: true,
    },
    {
      id: "challenge2",
      title: "Share Your Progress",
      description: "Post about your learning journey and tag #MyLearningJourney",
      startDate: "2025-07-15T00:00:00Z",
      endDate: "2025-08-15T23:59:59Z",
      badge: "🚀",
      participants: ["user2", "user4", "user6"],
      posts: ["7"],
      isActive: true,
    },
    {
      id: "challenge3",
      title: "Help Others",
      description: "Answer 10 questions in the forum to earn the Helper badge",
      startDate: "2025-06-01T00:00:00Z",
      endDate: "2025-06-30T23:59:59Z",
      badge: "🤝",
      participants: ["user3", "user7"],
      posts: [],
      isActive: false,
    },
  ];

  const HARDCODED_POSTS: Post[] = [
    {
      _id: "1",
      title: "Welcome to our community forum!",
      content: "This is the place to discuss all things related to our platform. Please be respectful and follow the community guidelines.",
      author: {
        _id: "admin1",
        name: "Admin Team",
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      },
      createdAt: "2025-07-01T10:00:00Z",
      likes: ["user1", "user2", "user3", "user4"],
      comments: [
        {
          id: "c1",
          content: "Great to be here! Looking forward to participating.",
          author: {
            _id: "user1",
            name: "Alex Johnson",
          },
          createdAt: "2025-07-01T11:30:00Z",
          likes: [],
        },
      ],
      views: 125,
      category: "announcements",
      tags: ["welcome", "introduction"],
      isPinned: true,
      reposts: ["user2", "user5"],
    },
    // ... other posts
  ];

  const HARDCODED_STATS: ForumStats = {
    totalTopics: 156,
    totalPosts: 482,
    activeUsers: 87,
    onlineNow: 23,
    newToday: 12,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 40,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 4,
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.text,
    },
    searchContainer: {
      padding: 12,
      paddingBottom: 8,
    },
    searchBar: {
      elevation: 0,
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
    },
    statsContainer: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    statsCard: {
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    onlineIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.primary}1A`,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    onlineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
      backgroundColor: "#4CAF50",
    },
    onlineText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingBottom: 16,
    },
    statItem: {
      width: "48%",
      marginBottom: 16,
      alignItems: "center",
      backgroundColor: `${colors.primary}0D`,
      padding: 12,
      borderRadius: 10,
    },
    statLabel: {
      fontSize: 13,
      marginVertical: 4,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    statValue: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.text,
    },
    tabsContainer: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      paddingHorizontal: 4,
    },
    tabsScroll: {
      flexDirection: "row",
    },
    tab: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      marginHorizontal: 1,
    },
    tabText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    categoriesContainer: {
      padding: 12,
      paddingBottom: 8,
    },
    categoryButton: {
      marginRight: 6,
      borderWidth: 1,
      borderRadius: 16,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderColor: colors.borderColor,
    },
    topicsContainer: {
      padding: 12,
      paddingTop: 8,
    },
    topicCard: {
      marginBottom: 12,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    pinnedBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    pinnedText: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    topicHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    topicInfo: {
      marginLeft: 10,
      flex: 1,
    },
    topicTitle: {
      fontSize: 15,
      fontWeight: "bold",
      marginBottom: 2,
      color: colors.text,
    },
    topicMeta: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    topicPreview: {
      fontSize: 13,
      marginBottom: 8,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    tag: {
      backgroundColor: `${colors.primary}1A`,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginRight: 6,
      marginBottom: 6,
    },
    tagText: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    topicStats: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: `${colors.primary}1A`,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    statText: {
      fontSize: 12,
      marginLeft: 4,
      color: colors.textSecondary,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    newDiscussionButton: {
      margin: 12,
      borderRadius: 8,
      position: "absolute",
      bottom: 0,
      left: 12,
      right: 12,
      backgroundColor: colors.primary,
    },
    challengeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.primary}1A`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 6,
    },
    challengeText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    repostContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    repostText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 6,
    },
    actionText: {
      fontSize: 12,
      marginLeft: 4,
      color: colors.textSecondary,
    },
    shareButton: {
      backgroundColor: `${colors.primary}1A`,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
    },
    challengeCard: {
      marginBottom: 12,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    challengeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    challengeTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
      color: colors.text,
    },
    challengeDate: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    challengeDescription: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    challengeStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    challengeStat: {
      alignItems: 'center',
    },
    challengeStatValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    challengeStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categories] = useState<Category[]>(HARDCODED_CATEGORIES);
  const [posts, setPosts] = useState<Post[]>(HARDCODED_POSTS);
  const [challenges] = useState<Challenge[]>(HARDCODED_CHALLENGES);
  const [stats] = useState<ForumStats>(HARDCODED_STATS);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: categories[0]?.id || "",
    challengeId: "",
  });

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              likes: post.likes.includes("currentUser")
                ? post.likes.filter((id) => id !== "currentUser")
                : [...post.likes, "currentUser"],
            }
          : post
      )
    );
  };

  const openPostDetails = (post: Post) => {
    setSelectedPost({ ...post, views: post.views + 1 });
    setShowDetailModal(true);
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === post._id ? { ...p, views: p.views + 1 } : p
      )
    );
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      content: replyText,
      author: {
        _id: "currentUser",
        name: user?.name || "You",
        avatar: user?.avatar,
      },
      createdAt: new Date().toISOString(),
      likes: [],
    };
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === selectedPost._id
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
    setSelectedPost({
      ...selectedPost,
      comments: [...selectedPost.comments, newComment],
    });
    setReplyText("");
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    const created: Post = {
      _id: `${Date.now()}`,
      title: newPost.title,
      content: newPost.content,
      author: {
        _id: "currentUser",
        name: user?.name || "You",
        avatar: user?.avatar,
      },
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      views: 0,
      category: newPost.category,
      tags: [],
    };
    setPosts([created, ...posts]);
    setShowCreateModal(false);
    setNewPost({ title: "", content: "", category: categories[0]?.id || "", challengeId: "" });
  };

  const handleRepost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? {
              ...post,
              reposts: post.reposts?.includes("currentUser")
                ? post.reposts.filter(id => id !== "currentUser")
                : [...(post.reposts || []), "currentUser"],
            }
          : post
      )
    );
    
    if (selectedPost?._id === postId) {
      setSelectedPost({
        ...selectedPost,
        reposts: selectedPost.reposts?.includes("currentUser")
          ? selectedPost.reposts.filter(id => id !== "currentUser")
          : [...(selectedPost.reposts || []), "currentUser"],
      });
    }
  };

  const handleSharePost = async (post: Post) => {
    try {
      const shareOptions = {
        title: post.title,
        message: `${post.title}\n\n${post.content}\n\nShared from TourLMS App`,
        url: `https://tourlms.app/forum/post/${post._id}`,
      };
      await Share.share(shareOptions);
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

  const shareToSocialMedia = (platform: string, post: Post) => {
    let url = "";
    const text = `${post.title}\n\n${post.content.substring(0, 100)}...`;
    const postUrl = `https://tourlms.app/forum/post/${post._id}`;

    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }

    Linking.openURL(url).catch(err => console.error("Error opening URL:", err));
  };

  const joinChallenge = (challengeId: string) => {
    console.log("Joined challenge:", challengeId);
  };

  const renderChallengeBadge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    return (
      <View style={styles.challengeBadge}>
        <MaterialCommunityIcons name="trophy" size={16} color={colors.primary} />
        <Text style={styles.challengeText}>{challenge.title}</Text>
      </View>
    );
  };

  const renderRepostInfo = (post: Post) => {
    if (!post.reposts || post.reposts.length === 0) return null;

    return (
      <View style={styles.repostContainer}>
        <MaterialCommunityIcons name="repeat" size={16} color={colors.textSecondary} />
        <Text style={styles.repostText}>
          {post.reposts.length} repost{post.reposts.length !== 1 ? 's' : ''}
        </Text>
      </View>
    );
  };

  const renderActionButtons = (post: Post) => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleLikePost(post._id)}
        >
          <MaterialCommunityIcons
            name={post.likes.includes("currentUser") ? "heart" : "heart-outline"}
            size={20}
            color={post.likes.includes("currentUser") ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedPost(post);
            setShowDetailModal(true);
          }}
        >
          <MaterialCommunityIcons
            name="comment"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleRepost(post._id)}
        >
          <MaterialCommunityIcons
            name="repeat"
            size={20}
            color={post.reposts?.includes("currentUser") ? colors.primary : colors.textSecondary}
          />
          <Text style={styles.actionText}>{post.reposts?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleSharePost(post)}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderChallengesTab = () => {
    return (
      <View style={styles.topicsContainer}>
        {challenges.map(challenge => (
          <Card key={challenge.id} style={styles.challengeCard}>
            <Card.Content>
              <View style={styles.challengeHeader}>
                <Text style={{ fontSize: 24 }}>{challenge.badge}</Text>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
              </View>
              
              <Text style={styles.challengeDate}>
                {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                {!challenge.isActive && " (Ended)"}
              </Text>
              
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              
              <View style={styles.challengeStats}>
                <View style={styles.challengeStat}>
                  <Text style={styles.challengeStatValue}>{challenge.participants.length}</Text>
                  <Text style={styles.challengeStatLabel}>Participants</Text>
                </View>
                
                <View style={styles.challengeStat}>
                  <Text style={styles.challengeStatValue}>{challenge.posts.length}</Text>
                  <Text style={styles.challengeStatLabel}>Posts</Text>
                </View>
              </View>
              
              {challenge.isActive && (
                <Button
                  mode="contained"
                  onPress={() => joinChallenge(challenge.id)}
                  style={{ marginTop: 12 }}
                  buttonColor={colors.primary}
                >
                  Join Challenge
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  const renderTopics = (topics: Post[]) => {
    const filteredTopics = topics.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const sortedTopics = [...filteredTopics].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      switch (activeTab) {
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return b.likes.length - a.likes.length;
        case "unanswered":
          return (
            (a.comments.length === 0 ? 1 : 0) -
            (b.comments.length === 0 ? 1 : 0)
          );
        default:
          return 0;
      }
    });

    return (
      <View style={styles.topicsContainer}>
        {sortedTopics.map((post) => (
          <TouchableOpacity
            key={post._id}
            onPress={() => openPostDetails(post)}
          >
            <Card
              style={[
                styles.topicCard,
                {
                  borderLeftWidth: post.isFeatured ? 4 : 1,
                  borderLeftColor: post.isFeatured ? colors.primary : colors.borderColor,
                },
              ]}
            >
              <Card.Content>
                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <MaterialCommunityIcons
                      name="pin"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                
                {post.challengeId && renderChallengeBadge(post.challengeId)}
                {renderRepostInfo(post)}
                
                <View style={styles.topicHeader}>
                  {post.author.avatar ? (
                    <Avatar.Image
                      size={36}
                      source={{ uri: post.author.avatar }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={36}
                      color={colors.primary}
                    />
                  )}
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>{post.title}</Text>
                    <Text style={styles.topicMeta}>
                      Posted by {post.author.name} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                
                <Text
                  style={styles.topicPreview}
                  numberOfLines={2}
                >
                  {post.content}
                </Text>
                
                {post.tags && post.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {post.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {renderActionButtons(post)}
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "categories":
        return (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                mode={selectedCategory === category.id ? "contained" : "outlined"}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id ? colors.primary : "transparent",
                    borderColor: colors.borderColor,
                  },
                ]}
                textColor={selectedCategory === category.id ? colors.onPrimary : colors.textSecondary}
                icon={category.icon}
              >
                {category.name} {category.count ? `(${category.count})` : ""}
              </Button>
            ))}
          </ScrollView>
        );
      case "challenges":
        return renderChallengesTab();
      case "recent":
        return renderTopics(posts);
      case "popular":
        return renderTopics(
          [...posts].sort((a, b) => b.likes.length - a.likes.length)
        );
      case "unanswered":
        return renderTopics(posts.filter((post) => post.comments.length === 0));
      default:
        return null;
    }
  };

  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      onRequestClose={() => setShowDetailModal(false)}
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {selectedPost && (
          <>
            <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button
                mode="text"
                onPress={() => setShowDetailModal(false)}
                textColor={colors.primary}
              >
                Back
              </Button>
              
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => shareToSocialMedia('twitter', selectedPost)}
                >
                  <MaterialCommunityIcons name="twitter" size={20} color="#1DA1F2" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.shareButton}
                  onPress={() => shareToSocialMedia('facebook', selectedPost)}
                >
                  <MaterialCommunityIcons name="facebook" size={20} color="#4267B2" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
              {/* Post Content */}
              <Card style={{ marginBottom: 16 }}>
                <Card.Content>
                  {selectedPost.isPinned && (
                    <View style={styles.pinnedBadge}>
                      <MaterialCommunityIcons
                        name="pin"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.pinnedText}>Pinned</Text>
                    </View>
                  )}
                  
                  {selectedPost.challengeId && renderChallengeBadge(selectedPost.challengeId)}
                  {renderRepostInfo(selectedPost)}
                  
                  <View style={styles.topicHeader}>
                    {selectedPost.author.avatar ? (
                      <Avatar.Image
                        size={36}
                        source={{ uri: selectedPost.author.avatar }}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={36}
                        color={colors.primary}
                      />
                    )}
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{selectedPost.title}</Text>
                      <Text style={styles.topicMeta}>
                        Posted by {selectedPost.author.name} •{' '}
                        {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: colors.text, marginBottom: 16 }}>
                    {selectedPost.content}
                  </Text>
                  
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {selectedPost.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  {renderActionButtons(selectedPost)}
                </Card.Content>
              </Card>
              
              {/* Comments Section */}
              <Text style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                color: colors.text, 
                marginBottom: 16 
              }}>
                Comments ({selectedPost.comments.length})
              </Text>
              
              {selectedPost.comments.map(comment => (
                <View 
                  key={comment.id} 
                  style={{ 
                    marginBottom: 16, 
                    padding: 12, 
                    backgroundColor: colors.cardBackground, 
                    borderRadius: 8 
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    {comment.author.avatar ? (
                      <Avatar.Image
                        size={32}
                        source={{ uri: comment.author.avatar }}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="account-circle"
                        size={32}
                        color={colors.primary}
                      />
                    )}
                    <Text style={{ 
                      marginLeft: 8, 
                      fontWeight: 'bold', 
                      color: colors.text 
                    }}>
                      {comment.author.name}
                    </Text>
                    <Text style={{ 
                      marginLeft: 8, 
                      fontSize: 12, 
                      color: colors.textSecondary 
                    }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text }}>
                    {comment.content}
                  </Text>
                </View>
              ))}
              
              {/* Add Comment Section */}
              <View style={{ marginTop: 16, marginBottom: 32 }}>
                <TextInput
                  style={{ 
                    borderWidth: 1, 
                    borderColor: colors.borderColor, 
                    borderRadius: 8, 
                    padding: 12, 
                    color: colors.text,
                    backgroundColor: colors.cardBackground,
                    marginBottom: 8
                  }}
                  placeholder="Write your comment..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  value={replyText}
                  onChangeText={setReplyText}
                />
                <Button
                  mode="contained"
                  onPress={handleReply}
                  disabled={!replyText.trim()}
                >
                  Post Comment
                </Button>
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </Modal>
  );
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>
          Associate with Challenge (optional)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {challenges.filter(c => c.isActive).map(challenge => (
            <Button
              key={challenge.id}
              mode={newPost.challengeId === challenge.id ? "contained" : "outlined"}
              onPress={() => setNewPost({ ...newPost, challengeId: challenge.id })}
              style={{ marginRight: 8, borderColor: colors.borderColor }}
              buttonColor={newPost.challengeId === challenge.id ? colors.primary : undefined}
              textColor={newPost.challengeId === challenge.id ? colors.onPrimary : colors.textSecondary}
            >
              {challenge.title}
            </Button>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderChallengeModal = () => (
    <Modal
      visible={showChallengeModal}
      animationType="slide"
      onRequestClose={() => setShowChallengeModal(false)}
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        <Button
          mode="text"
          onPress={() => setShowChallengeModal(false)}
          textColor={colors.primary}
          style={{ alignSelf: 'flex-start' }}
        >
          Back
        </Button>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
          Current Challenges
        </Text>
        
        {renderChallengesTab()}
      </View>
    </Modal>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
      >
        {["categories", "challenges", "recent", "popular", "unanswered"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && {
                borderBottomColor: colors.primary,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Community Forum</Text>
        <Text style={styles.headerSubtitle}>Connect, learn and share</Text>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search discussions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={{ color: colors.text }}
            iconColor={colors.textSecondary}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Community Stats</Text>
                <View style={styles.onlineIndicator}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>{stats.onlineNow} online</Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="forum"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.statLabel}>Topics</Text>
                  <Text style={styles.statValue}>{stats.totalTopics}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="comment"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.statLabel}>Posts</Text>
                  <Text style={styles.statValue}>{stats.totalPosts}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.statLabel}>Users</Text>
                  <Text style={styles.statValue}>{stats.activeUsers}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="calendar-today"
                    size={24}
                    color={colors.primary}
                  />
                  <Text style={styles.statLabel}>New Today</Text>
                  <Text style={styles.statValue}>{stats.newToday}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {renderTabs()}
        {renderTabContent()}
      </ScrollView>

      {renderDetailModal()}
      {renderCreateModal()}
      {renderChallengeModal()}
      
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={styles.newDiscussionButton}
        icon="plus"
        labelStyle={{ color: colors.onPrimary }}
      >
        New Discussion
      </Button>
      
      <Button
        mode="contained-tonal"
        onPress={() => setShowChallengeModal(true)}
        style={[styles.newDiscussionButton, { bottom: 60 }]}
        icon="trophy"
        labelStyle={{ color: colors.onPrimary }}
      >
        View Challenges
      </Button>
    </View>
  );
}