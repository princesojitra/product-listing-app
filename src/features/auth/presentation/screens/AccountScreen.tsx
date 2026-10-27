import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useToast } from '../../../../core/ui/Toast';
import { useAuth } from '../context/AuthContext';

/**
 * Minimal profile screen: just enough to verify who's signed in and sign
 * out. Rendered as its own tab with the native header shown (unlike
 * Products/Categories, it has no nested stack of its own).
 */
export function AccountScreen() {
  const { state, logout } = useAuth();
  const { show: showToast } = useToast();

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
    <View style={styles.container}>
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

      <Pressable
        onPress={confirmLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out"
        style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 48,
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
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
});
