import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Searchbar, Text } from "react-native-paper";
import Colors from "../../constants/colors";

export default function ForumScreen() {
  const theme = useColorScheme() ?? "light";

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
  }

  interface ForumStats {
    totalTopics: number;
    totalPosts: number;
    activeUsers: number;
    onlineNow: number;
    newToday: number;
  }

  // Hardcoded data
  const HARDCODED_CATEGORIES: Category[] = [
    { id: "general", name: "General Discussion", icon: "forum", count: 42 },
    { id: "questions", name: "Questions", icon: "help-circle", count: 28 },
    { id: "announcements", name: "Announcements", icon: "bullhorn", count: 15 },
    { id: "feedback", name: "Feedback", icon: "message-alert", count: 23 },
    { id: "ideas", name: "Ideas", icon: "lightbulb-on", count: 17 },
    { id: "challenges", name: "Challenges", icon: "trophy", count: 9 },
  ];

  const HARDCODED_POSTS: Post[] = [
    {
      _id: "1",
      title: "Welcome to our community forum!",
      content:
        "This is the place to discuss all things related to our platform. Please be respectful and follow the community guidelines.",
      author: {
        _id: "admin1",
        name: "Admin Team",
        avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
      },
      createdAt: "2023-05-01T10:00:00Z",
      likes: ["user1", "user2", "user3", "user4"],
      comments: [
        {
          id: "c1",
          content: "Great to be here! Looking forward to participating.",
          author: {
            _id: "user1",
            name: "Alex Johnson",
          },
          createdAt: "2023-05-01T11:30:00Z",
          likes: [],
        },
      ],
      views: 125,
      category: "announcements",
      tags: ["welcome", "introduction"],
      isPinned: true,
    },
    {
      _id: "2",
      title: "How to get started with the platform?",
      content:
        "I'm new here and would love some tips on how to make the most of this platform. Any suggestions for beginners?",
      author: {
        _id: "user2",
        name: "Sarah Williams",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      createdAt: "2023-05-10T14:25:00Z",
      likes: ["user3", "user5", "user7"],
      comments: [
        {
          id: "c2",
          content:
            "Start with the onboarding courses - they give a great overview!",
          author: {
            _id: "user3",
            name: "Michael Brown",
          },
          createdAt: "2023-05-10T15:10:00Z",
          likes: ["user2"],
        },
        {
          id: "c3",
          content: "I found the documentation really helpful when I started.",
          author: {
            _id: "user4",
            name: "Emily Davis",
          },
          createdAt: "2023-05-10T16:45:00Z",
          likes: [],
        },
      ],
      views: 89,
      category: "questions",
      tags: ["getting-started", "help"],
    },
    {
      _id: "3",
      title: "Feature Request: Dark Mode",
      content:
        "Would love to see a dark mode option in the app. Anyone else interested in this feature?",
      author: {
        _id: "user5",
        name: "David Wilson",
      },
      createdAt: "2023-05-12T09:15:00Z",
      likes: ["user1", "user2", "user6", "user7", "user8"],
      comments: [],
      views: 64,
      category: "ideas",
      tags: ["feature-request", "ui"],
      isFeatured: true,
    },
    {
      _id: "4",
      title: "Monthly Challenge: Complete 5 courses",
      content:
        "This month's challenge is to complete 5 courses. Participants will receive a special badge!",
      author: {
        _id: "admin2",
        name: "Challenge Team",
        avatar: "https://randomuser.me/api/portraits/lego/2.jpg",
      },
      createdAt: "2023-05-15T08:00:00Z",
      likes: ["user1", "user3", "user5", "user9"],
      comments: [
        {
          id: "c4",
          content: "Excited for this! What counts as a completed course?",
          author: {
            _id: "user6",
            name: "Jessica Lee",
          },
          createdAt: "2023-05-15T10:30:00Z",
          likes: [],
        },
      ],
      views: 112,
      category: "challenges",
      tags: ["challenge", "badge"],
      isPinned: true,
    },
    {
      _id: "5",
      title: "Bug Report: Login issue on Android",
      content:
        "Getting an error when trying to login on Android devices. Anyone else experiencing this?",
      author: {
        _id: "user7",
        name: "Robert Garcia",
        avatar: "https://randomuser.me/api/portraits/men/3.jpg",
      },
      createdAt: "2023-05-14T18:20:00Z",
      likes: ["user8"],
      comments: [
        {
          id: "c5",
          content:
            "Yes, seeing the same issue. Temporary workaround is to clear app cache.",
          author: {
            _id: "user8",
            name: "Olivia Martinez",
          },
          createdAt: "2023-05-14T19:05:00Z",
          likes: ["user7"],
        },
        {
          id: "c6",
          content:
            "We're aware of the issue and working on a fix. Thanks for reporting!",
          author: {
            _id: "admin1",
            name: "Admin Team",
          },
          createdAt: "2023-05-14T20:15:00Z",
          likes: ["user7", "user8", "user9"],
        },
      ],
      views: 76,
      category: "feedback",
      tags: ["bug", "android"],
    },
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
      backgroundColor: Colors[theme].BACKGROUND,
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
    },
    headerSubtitle: {
      fontSize: 14,
    },
    searchContainer: {
      padding: 12,
      paddingBottom: 8,
    },
    searchBar: {
      elevation: 0,
      borderWidth: 1,
      borderColor: Colors[theme].BORDER_COLOR,
      borderRadius: 8,
    },
    statsContainer: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    statsCard: {
      borderWidth: 1,
      borderRadius: 12,
      backgroundColor: Colors[theme].CARD_BACKGROUND,
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
      color: Colors[theme].TEXT_PRIMARY,
    },
    onlineIndicator: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
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
      color: Colors[theme].TEXT_SECONDARY,
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
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      padding: 12,
      borderRadius: 10,
    },
    statLabel: {
      fontSize: 13,
      marginVertical: 4,
      color: Colors[theme].TEXT_SECONDARY,
      fontWeight: "500",
    },
    statValue: {
      fontSize: 22,
      fontWeight: "bold",
      color: Colors[theme].TEXT_PRIMARY,
    },
    tabsContainer: {
      borderBottomWidth: 1,
      borderBottomColor: Colors[theme].BORDER_COLOR,
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
    },
    pinnedBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    pinnedText: {
      fontSize: 11,
      color: Colors[theme].TEXT_SECONDARY,
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
    },
    topicMeta: {
      fontSize: 12,
    },
    topicPreview: {
      fontSize: 13,
      marginBottom: 8,
      lineHeight: 18,
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 8,
    },
    tag: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 3,
      marginRight: 6,
      marginBottom: 6,
    },
    tagText: {
      fontSize: 11,
      color: Colors[theme].TEXT_SECONDARY,
    },
    topicStats: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.1)",
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    statText: {
      fontSize: 12,
      marginLeft: 4,
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
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [categories] = useState<Category[]>(HARDCODED_CATEGORIES);
  const [posts, setPosts] = useState<Post[]>(HARDCODED_POSTS);
  const [stats] = useState<ForumStats>(HARDCODED_STATS);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Modal and form state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: categories[0]?.id || "",
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh with timeout
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

  // Handle opening post details and incrementing view count
  const openPostDetails = (post: Post) => {
    setSelectedPost({ ...post, views: post.views + 1 });
    setShowDetailModal(true);
    // Increment view count in posts array
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === post._id ? { ...p, views: p.views + 1 } : p
      )
    );
  };

  // Handle reply
  const handleReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      content: replyText,
      author: {
        _id: "currentUser",
        name: "You",
        avatar: undefined,
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

  // Handle new post creation
  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    const created: Post = {
      _id: `${Date.now()}`,
      title: newPost.title,
      content: newPost.content,
      author: {
        _id: "currentUser",
        name: "You",
        avatar: undefined,
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
    setNewPost({ title: "", content: "", category: categories[0]?.id || "" });
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
                mode={
                  selectedCategory === category.id ? "contained" : "outlined"
                }
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      selectedCategory === category.id
                        ? Colors[theme].PRIMARY
                        : "transparent",
                    borderColor: Colors[theme].BORDER_COLOR,
                  },
                ]}
                textColor={
                  selectedCategory === category.id
                    ? Colors[theme].TEXT_PRIMARY
                    : Colors[theme].TEXT_SECONDARY
                }
                icon={category.icon}
              >
                {category.name} {category.count ? `(${category.count})` : ""}
              </Button>
            ))}
          </ScrollView>
        );
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
                  backgroundColor: Colors[theme].CARD_BACKGROUND,
                  borderColor: Colors[theme].BORDER_COLOR,
                  borderLeftWidth: post.isFeatured ? 4 : 1,
                  borderLeftColor: post.isFeatured
                    ? "#FFA500"
                    : Colors[theme].BORDER_COLOR,
                },
              ]}
            >
              <Card.Content>
                {post.isPinned && (
                  <View style={styles.pinnedBadge}>
                    <MaterialCommunityIcons
                      name="pin"
                      size={16}
                      color={Colors[theme].TEXT_SECONDARY}
                    />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
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
                      color={Colors[theme].PRIMARY}
                    />
                  )}
                  <View style={styles.topicInfo}>
                    <Text
                      style={[
                        styles.topicTitle,
                        { color: Colors[theme].TEXT_PRIMARY },
                      ]}
                    >
                      {post.title}
                    </Text>
                    <Text
                      style={[
                        styles.topicMeta,
                        { color: Colors[theme].TEXT_SECONDARY },
                      ]}
                    >
                      Posted by {post.author.name} •{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.topicPreview,
                    { color: Colors[theme].TEXT_SECONDARY },
                  ]}
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
                <View style={styles.topicStats}>
                  <TouchableOpacity
                    style={styles.stat}
                    onPress={() => handleLikePost(post._id)}
                  >
                    <MaterialCommunityIcons
                      name={
                        post.likes.includes("currentUser")
                          ? "heart"
                          : "heart-outline"
                      }
                      size={16}
                      color={
                        post.likes.includes("currentUser")
                          ? Colors[theme].PRIMARY
                          : Colors[theme].TEXT_SECONDARY
                      }
                    />
                    <Text
                      style={[
                        styles.statText,
                        { color: Colors[theme].TEXT_SECONDARY },
                      ]}
                    >
                      {post.likes.length}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="comment"
                      size={16}
                      color={Colors[theme].TEXT_SECONDARY}
                    />
                    <Text
                      style={[
                        styles.statText,
                        { color: Colors[theme].TEXT_SECONDARY },
                      ]}
                    >
                      {post.comments.length} replies
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <MaterialCommunityIcons
                      name="eye"
                      size={16}
                      color={Colors[theme].TEXT_SECONDARY}
                    />
                    <Text
                      style={[
                        styles.statText,
                        { color: Colors[theme].TEXT_SECONDARY },
                      ]}
                    >
                      {post.views} views
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Forum detail modal
  const renderDetailModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      onRequestClose={() => setShowDetailModal(false)}
      transparent={false}
    >
      <View style={{ flex: 1, backgroundColor: Colors[theme].BACKGROUND }}>
        {selectedPost && (
          <ScrollView style={{ flex: 1 }}>
            <View style={{ padding: 16 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: Colors[theme].TEXT_PRIMARY,
                }}
              >
                {selectedPost.title}
              </Text>
              <Text
                style={{ color: Colors[theme].TEXT_SECONDARY, marginBottom: 8 }}
              >
                By {selectedPost.author.name} •{" "}
                {new Date(selectedPost.createdAt).toLocaleString()}
              </Text>
              <Text
                style={{ color: Colors[theme].TEXT_PRIMARY, marginBottom: 16 }}
              >
                {selectedPost.content}
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <Text
                  style={{
                    marginRight: 16,
                    color: Colors[theme].TEXT_SECONDARY,
                  }}
                >
                  Views: {selectedPost.views}
                </Text>
                <Text
                  style={{
                    marginRight: 16,
                    color: Colors[theme].TEXT_SECONDARY,
                  }}
                >
                  Likes: {selectedPost.likes.length}
                </Text>
                <Text style={{ color: Colors[theme].TEXT_SECONDARY }}>
                  Replies: {selectedPost.comments.length}
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: "bold",
                  color: Colors[theme].TEXT_PRIMARY,
                  marginBottom: 8,
                }}
              >
                Replies
              </Text>
              {selectedPost.comments.length === 0 && (
                <Text style={{ color: Colors[theme].TEXT_SECONDARY }}>
                  No replies yet.
                </Text>
              )}
              {selectedPost.comments.map((comment) => (
                <View
                  key={comment.id}
                  style={{
                    marginBottom: 12,
                    padding: 8,
                    backgroundColor: Colors[theme].CARD_BACKGROUND,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: Colors[theme].TEXT_PRIMARY,
                    }}
                  >
                    {comment.author.name}
                  </Text>
                  <Text
                    style={{
                      color: Colors[theme].TEXT_SECONDARY,
                      fontSize: 12,
                    }}
                  >
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                  <Text style={{ color: Colors[theme].TEXT_PRIMARY }}>
                    {comment.content}
                  </Text>
                </View>
              ))}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: Colors[theme].BORDER_COLOR,
                    borderRadius: 8,
                    padding: 8,
                    color: Colors[theme].TEXT_PRIMARY,
                    backgroundColor: Colors[theme].CARD_BACKGROUND,
                  }}
                  placeholder="Write a reply..."
                  placeholderTextColor={Colors[theme].TEXT_SECONDARY}
                  value={replyText}
                  onChangeText={setReplyText}
                />
                <Button
                  mode="contained"
                  onPress={handleReply}
                  style={{ marginLeft: 8 }}
                >
                  Reply
                </Button>
              </View>
            </View>
          </ScrollView>
        )}
        <Button
          mode="outlined"
          onPress={() => setShowDetailModal(false)}
          style={{ margin: 16 }}
        >
          Close
        </Button>
      </View>
    </Modal>
  );

  // Create forum modal
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      onRequestClose={() => setShowCreateModal(false)}
      transparent={false}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: Colors[theme].BACKGROUND,
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: Colors[theme].TEXT_PRIMARY,
            marginBottom: 16,
          }}
        >
          New Discussion
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors[theme].BORDER_COLOR,
            borderRadius: 8,
            padding: 8,
            color: Colors[theme].TEXT_PRIMARY,
            backgroundColor: Colors[theme].CARD_BACKGROUND,
            marginBottom: 12,
          }}
          placeholder="Title"
          placeholderTextColor={Colors[theme].TEXT_SECONDARY}
          value={newPost.title}
          onChangeText={(text) => setNewPost({ ...newPost, title: text })}
        />
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: Colors[theme].BORDER_COLOR,
            borderRadius: 8,
            padding: 8,
            color: Colors[theme].TEXT_PRIMARY,
            backgroundColor: Colors[theme].CARD_BACKGROUND,
            marginBottom: 12,
            minHeight: 80,
          }}
          placeholder="Content"
          placeholderTextColor={Colors[theme].TEXT_SECONDARY}
          value={newPost.content}
          onChangeText={(text) => setNewPost({ ...newPost, content: text })}
          multiline
        />
        <Text style={{ color: Colors[theme].TEXT_SECONDARY, marginBottom: 4 }}>
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              mode={newPost.category === category.id ? "contained" : "outlined"}
              onPress={() => setNewPost({ ...newPost, category: category.id })}
              style={{ marginRight: 8 }}
            >
              {category.name}
            </Button>
          ))}
        </ScrollView>
        <Button
          mode="contained"
          onPress={handleCreatePost}
          style={{ marginBottom: 12 }}
        >
          Create
        </Button>
        <Button mode="outlined" onPress={() => setShowCreateModal(false)}>
          Cancel
        </Button>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[theme].PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: Colors[theme].PRIMARY }]}>
        <Text
          style={[styles.headerTitle, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          Community Forum
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: Colors[theme].TEXT_PRIMARY }]}
        >
          Connect, learn and share
        </Text>
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
            style={[
              styles.searchBar,
              { backgroundColor: Colors[theme].CARD_BACKGROUND },
            ]}
            inputStyle={{ color: Colors[theme].TEXT_PRIMARY }}
            iconColor={Colors[theme].TEXT_SECONDARY}
            placeholderTextColor={Colors[theme].TEXT_SECONDARY}
          />
        </View>

        <View style={styles.statsContainer}>
          <Card
            style={[
              styles.statsCard,
              {
                backgroundColor: Colors[theme].CARD_BACKGROUND,
                borderColor: Colors[theme].BORDER_COLOR,
              },
            ]}
          >
            <Card.Content>
              <View style={styles.statsHeader}>
                <Text
                  style={[
                    styles.statsTitle,
                    { color: Colors[theme].TEXT_PRIMARY },
                  ]}
                >
                  Community Stats
                </Text>
                <View style={styles.onlineIndicator}>
                  <View
                    style={[styles.onlineDot, { backgroundColor: "#4CAF50" }]}
                  />
                  <Text
                    style={[
                      styles.onlineText,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    {stats.onlineNow} online
                  </Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="forum"
                    size={24}
                    color={Colors[theme].PRIMARY}
                  />
                  <Text
                    style={[
                      styles.statLabel,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    Topics
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: Colors[theme].TEXT_PRIMARY },
                    ]}
                  >
                    {stats.totalTopics}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="comment"
                    size={24}
                    color={Colors[theme].PRIMARY}
                  />
                  <Text
                    style={[
                      styles.statLabel,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    Posts
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: Colors[theme].TEXT_PRIMARY },
                    ]}
                  >
                    {stats.totalPosts}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={24}
                    color={Colors[theme].PRIMARY}
                  />
                  <Text
                    style={[
                      styles.statLabel,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    Users
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: Colors[theme].TEXT_PRIMARY },
                    ]}
                  >
                    {stats.activeUsers}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name="calendar-today"
                    size={24}
                    color={Colors[theme].PRIMARY}
                  />
                  <Text
                    style={[
                      styles.statLabel,
                      { color: Colors[theme].TEXT_SECONDARY },
                    ]}
                  >
                    New Today
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: Colors[theme].TEXT_PRIMARY },
                    ]}
                  >
                    {stats.newToday}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
          >
            {["categories", "recent", "popular", "unanswered"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    borderBottomColor: Colors[theme].PRIMARY,
                    borderBottomWidth: 2,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        activeTab === tab
                          ? Colors[theme].PRIMARY
                          : Colors[theme].TEXT_SECONDARY,
                    },
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {renderTabContent()}
      </ScrollView>

      {renderDetailModal()}
      {renderCreateModal()}
      <Button
        mode="contained"
        onPress={() => setShowCreateModal(true)}
        style={[
          styles.newDiscussionButton,
          { backgroundColor: Colors[theme].PRIMARY },
        ]}
        icon="plus"
        labelStyle={{ color: Colors[theme].TEXT_PRIMARY }}
      >
        New Discussion
      </Button>
    </View>
  );
}
