import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../../app/contexts/ThemeContext';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  // If you need token for logout, uncomment below:
  // const { token } = useTourLMS();
  const { colors } = useTheme();

  return (
    <Button
      mode="outlined"
      onPress={onLogout}
      style={[styles.logoutButton, { borderColor: colors.borderColor }]}
      textColor={colors.text}
      icon="logout"
    >
      Log Out
    </Button>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default LogoutButton;