import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountScreen } from '../../../features/auth';
import { glassHeaderScreenOptions } from '../shared/glassHeaderScreenOptions';

type AccountStackParamList = { AccountHome: undefined };

const Stack = createNativeStackNavigator<AccountStackParamList>();

/**
 * The native bottom-tab navigator (`react-native-bottom-tabs`) renders only
 * the tab bar, not a header — so, like the Products/Categories tabs, the
 * Account tab gets its own single-screen stack purely to get a native
 * header.
 */
export function AccountNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AccountHome"
        component={AccountScreen}
        options={{ ...glassHeaderScreenOptions, title: 'Account' }}
      />
    </Stack.Navigator>
  );
}
