import React from 'react';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { useToast } from '../../../../core/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useGlassScrollInsets } from '../../../../app/navigation/shared/layoutInsets';
import { AccountStackParamList } from '../../../../app/navigation/types';
import { GlassButton } from '../../../../core/ui/GlassButton';

const HELP_URL = 'https://github.com/princesojitra/property-listing-app/issues';

/** The platform's native in-app browser (SFSafariViewController / Chrome Custom Tabs). */
function openHelp() {
  InAppBrowser.open(HELP_URL).catch(() => Linking.openURL(HELP_URL));
}

type AccountNavigationProp = NativeStackNavigationProp<AccountStackParamList, 'AccountHome'>;

/**
 * Minimal profile screen: just enough to verify who's signed in, reach
 * About/Help, and sign out. Rendered as its own tab with the native header
 * shown (unlike Products/Categories, it has no nested stack of its own).
 */
export function AccountScreen() {
  const { state, logout } = useAuth();
  const { show: showToast } = useToast();
  const { topInset } = useGlassScrollInsets();
  const navigation = useNavigation<AccountNavigationProp>();

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

      <View style={styles.list}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="About"
          onPress={() => navigation.navigate('About')}>
          <View style={[styles.icon, styles.iconAbout]}>
            <MaterialIcons name="info-outline" size={20} color="#4338ca" />
          </View>
          <Text style={styles.rowText}>About</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          accessibilityRole="button"
          accessibilityLabel="Need help?"
          onPress={openHelp}>
          <View style={[styles.icon, styles.iconHelp]}>
            <MaterialIcons name="help-outline" size={20} color="#047857" />
          </View>
          <Text style={styles.rowText}>Need help?</Text>
          <MaterialIcons name="open-in-new" size={18} color="#d1d5db" />
        </Pressable>
      </View>

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
  list: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  rowPressed: {
    opacity: 0.7,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconAbout: {
    backgroundColor: '#eef2ff',
  },
  iconHelp: {
    backgroundColor: '#ecfdf5',
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chevron: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d1d5db',
    marginLeft: 8,
  },
  logoutButton: {
    paddingHorizontal: 32,
  },
});
