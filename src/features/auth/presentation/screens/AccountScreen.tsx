import React from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { useToast } from '../../../../core/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { GlassButton } from '../../../../core/ui/GlassButton';

/**
 * Minimal profile screen: just enough to verify who's signed in and sign
 * out. Rendered as its own tab with the native header shown (unlike
 * Products/Categories, it has no nested stack of its own).
 */
export function AccountScreen() {
  const { state, logout } = useAuth();
  const { show: showToast } = useToast();
  const { topInset } = useGlassScrollInsets();

  if (state.status !== 'signedIn') {
    return null;
  }

  const { user } = state;

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          showToast('Logged out successfully');
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { paddingTop: topInset + 24 }]}>
      <Image
        source={{ uri: user.imageUrl }}
        style={styles.avatar}
        accessibilityIgnoresInvertColors
        accessibilityLabel={`${user.firstName} ${user.lastName}'s avatar`}
      />
      <Text style={styles.name} accessibilityRole="header">
        {user.firstName} {user.lastName}
      </Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.username}>@{user.username}</Text>

      <GlassButton
        label="Log Out"
        accessibilityLabel="Log out"
        onPress={confirmLogout}
        variant="destructive"
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e5e7eb',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  username: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
    marginBottom: 32,
  },
  logoutButton: {
    paddingHorizontal: 32,
  },
});
