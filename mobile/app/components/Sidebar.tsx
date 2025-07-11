import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const translateX = useState(new Animated.Value(SCREEN_WIDTH))[0];

  const toggleSidebar = (show: boolean) => {
    Animated.timing(translateX, {
      toValue: show ? 0 : SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsOpen(show));
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      gestureState.dx < -20 || gestureState.dx > 20,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 50 && !isOpen) {
        toggleSidebar(true);
      } else if (gestureState.dx < -50 && isOpen) {
        toggleSidebar(false);
      }
    },
  });

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      {/* Sidebar Panel */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <Text style={styles.title}>Menu</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => toggleSidebar(false)}>
            <MaterialCommunityIcons name="home" color="#fff" size={20} />
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="cog" color="#fff" size={20} />
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="logout" color="#fff" size={20} />
            <Text style={styles.menuText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderLeftWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 999,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
  },
});
