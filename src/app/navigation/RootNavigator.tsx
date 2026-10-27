import React from 'react';
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
    <AuthProvider login={container.login} sessionStorage={container.sessionStorage}>
      <NavigationContainer>
        <AuthGate />
      </NavigationContainer>
    </AuthProvider>
  );
}

/**
 * Switches between the signed-out (Login) and signed-in (tabs) experience
 * from the single `AuthContext` source of truth, inside the same
 * `NavigationContainer` so the app isn't torn down on sign-in.
 */
function AuthGate() {
  const { state } = useAuth();

  if (state.status === 'signedOut') {
    return <LoginScreen />;
  }

  return (
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
  );
}
