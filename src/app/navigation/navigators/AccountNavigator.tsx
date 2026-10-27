import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountScreen, AboutScreen } from '../../../features/auth';
import { AccountStackParamList } from '../types';
import { glassHeaderScreenOptions } from '../shared/glassHeaderScreenOptions';

const Stack = createNativeStackNavigator<AccountStackParamList>();

/**
 * The native bottom-tab navigator (`react-native-bottom-tabs`) renders only
 * the tab bar, not a header — so, like the Products/Categories tabs, the
 * Account tab gets its own single-screen stack purely to get a native
 * header. `About` is a plain informational screen, not part of the glass
 * design (no edge-to-edge content), so it forces a normal opaque header
 * regardless of platform/iOS version. "Need help?" doesn't live here at
 * all — it opens the system in-app browser (`InAppBrowser.open`) directly
 * from `AccountScreen`, with no navigation route of its own.
 */
export function AccountNavigator() {
  return (
    <Stack.Navigator screenOptions={glassHeaderScreenOptions}>
      <Stack.Screen name="AccountHome" component={AccountScreen} options={{ title: 'Account' }} />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About', headerTransparent: false, headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack.Navigator>
  );
}
