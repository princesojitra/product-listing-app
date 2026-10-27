import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// The default (non-"/static") import uses dynamic font loading, which
// needs Expo's font loader to actually register the font — it renders as a
// tofu box on bare React Native CLI apps. `/static` relies on the font
// being linked natively (via the package's podspec/Gradle autolinking),
// which is what bare RN CLI apps need.
import { MaterialIcons } from '@react-native-vector-icons/material-icons/static';
import { ProductsNavigator } from './ProductsNavigator';
import { CategoriesNavigator } from './CategoriesNavigator';
import { RootTabParamList } from './navigationTypes';
import { AuthProvider, LoginScreen, useAuth } from '../../features/auth';
import { container } from '../../di/container';

const Tab = createBottomTabNavigator<RootTabParamList>();

function ProductsTabIcon({ color, size }: { color: string; size: number }) {
  return <MaterialIcons name="storefront" color={color} size={size} />;
}

function CategoriesTabIcon({ color, size }: { color: string; size: number }) {
  return <MaterialIcons name="category" color={color} size={size} />;
}

/**
 * App-level root: a bottom-tab navigator. Each tab owns its header — the
 * tab navigator's own header is hidden so it never stacks a second header
 * on top of a tab's content (the Products tab already manages its own via
 * its nested stack).
 */
export function RootNavigator() {
  return (
    <AuthProvider
      login={container.login}
      logout={container.logout}
      restoreSession={container.restoreSession}
      sessionStorage={container.sessionStorage}>
      <NavigationContainer>
        <AuthGate />
      </NavigationContainer>
    </AuthProvider>
  );
}

/**
 * Switches between checking/signed-out/signed-in experiences from the
 * single `AuthContext` source of truth, inside the same
 * `NavigationContainer` so the app isn't torn down on sign-in.
 */
function AuthGate() {
  const { state, logout } = useAuth();

  if (state.status === 'checking') {
    return (
      <View style={styles.checkingContainer}>
        <ActivityIndicator size="large" accessibilityLabel="Checking session" />
      </View>
    );
  }

  if (state.status === 'signedOut') {
    return <LoginScreen />;
  }

  return (
    <View style={styles.signedInContainer}>
      <SafeAreaView edges={['top']} style={styles.accountBar}>
        <Text style={styles.accountText} numberOfLines={1}>
          {state.user.firstName} {state.user.lastName}
        </Text>
        <Pressable
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={styles.logoutButton}>
          <MaterialIcons name="logout" size={20} color="#374151" />
        </Pressable>
      </SafeAreaView>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Products"
          component={ProductsNavigator}
          options={{ tabBarIcon: ProductsTabIcon }}
        />
        <Tab.Screen
          name="Categories"
          component={CategoriesNavigator}
          options={{ tabBarIcon: CategoriesTabIcon }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  checkingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  signedInContainer: {
    flex: 1,
  },
  accountBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d5db',
  },
  accountText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  logoutButton: {
    padding: 6,
  },
});
