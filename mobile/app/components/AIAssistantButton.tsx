import React, { useState } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AIAssistant from './AIAssistant';
import { PRIMARY } from '../constants/colors';

export default function AIAssistantButton() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <IconButton
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="robot" size={size} color={color} />
        )}
        mode="contained"
        size={24}
        style={styles.floatingButton}
        onPress={() => setIsVisible(true)}
      />

      <Modal
        visible={isVisible}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <IconButton
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="close" size={size} color={color} />
            )}
            size={24}
            style={styles.closeButton}
            onPress={() => setIsVisible(false)}
          />
          <AIAssistant />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: PRIMARY,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
}); 