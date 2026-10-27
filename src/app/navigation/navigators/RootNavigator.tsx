import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { isLiquidGlassSupported } from '@callstack/liquid-glass';
import { ProductsNavigator } from './ProductsNavigator';
import { CategoriesNavigator } from './CategoriesNavigator';
import { AccountNavigator } from './AccountNavigator';
import { RootTabParamList } from '../types';
import { AuthProvider, LoginScreen, useAuth } from '../../../features/auth';
import { container } from '../../../di/container';

const Tab = createNativeBottomTabNavigator<RootTabParamList>();

/**
 * `react-native-bottom-tabs` wraps a real system tab bar (`UITabBarController`
 * on iOS, Material `BottomNavigation` on Android), so on iOS 26+ it gets
 * genuine Liquid Glass automatically from the OS — no custom view needed.
 * Icons: SF Symbols on iOS (crisp, native); flat template PNGs on Android
 * (tinted automatically by the system, like any Material bottom-nav icon).
 */
function productsIcon({ focused }: { focused: boolean }) {
  return Platform.OS === 'ios'
    ? { sfSymbol: focused ? 'storefront.fill' : 'storefront' as const }
    : require('../../../assets/icons/products.png');
}

function categoriesIcon({ focused }: { focused: boolean }) {
  return Platform.OS === 'ios'
    ? { sfSymbol: focused ? 'square.grid.2x2.fill' : 'square.grid.2x2' as const }
    : require('../../../assets/icons/categories.png');
}

function accountIcon({ focused }: { focused: boolean }) {
  return Platform.OS === 'ios'
    ? { sfSymbol: focused ? 'person.crop.circle.fill' : 'person.crop.circle' as const }
    : require('../../../assets/icons/account.png');
}

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
  const { state } = useAuth();

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
    <Tab.Navigator
      translucent={isLiquidGlassSupported}
      minimizeBehavior="automatic"
      // Real translucency only happens on iOS 26+ (Liquid Glass). Everywhere
      // else (older iOS, and Android's Material tab bar which otherwise
      // falls back to black under this app's AppCompat/non-Material theme)
      // gets an explicit opaque background instead.
      tabBarStyle={isLiquidGlassSupported ? undefined : { backgroundColor: '#ffffff' }}>
      <Tab.Screen
        name="Products"
        component={ProductsNavigator}
        options={{ tabBarIcon: productsIcon }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesNavigator}
        options={{ tabBarIcon: categoriesIcon }}
      />
      <Tab.Screen
        name="Account"
        component={AccountNavigator}
        options={{ title: 'Account', tabBarIcon: accountIcon }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  checkingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
});
