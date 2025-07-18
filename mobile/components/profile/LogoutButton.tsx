import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

interface LogoutButtonProps {
  onLogout: () => void;
  colors: {
    BORDER_COLOR: string;
    TEXT_PRIMARY: string;
  };
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout, colors }) => {
  // If you need token for logout, uncomment below:
  // const { token } = useTourLMS();

  return (
    <Button
      mode="outlined"
      onPress={onLogout}
      style={[styles.logoutButton, { borderColor: colors.BORDER_COLOR }]}
      textColor={colors.TEXT_PRIMARY}
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