import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../di/container';
import { ListingsScreen, PropertyDetailsScreen } from '../../features/listings';
import { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * App-level composition for navigation. This is the one place outside
 * `di/container.ts` allowed to reach into `container` directly, since
 * wiring a concrete dependency to a route is a composition concern, not a
 * domain or presentation one.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Listings">
        <Stack.Screen name="Listings" options={{ headerShown: false }}>
          {() => <ListingsScreen repository={container.listingRepository} />}
        </Stack.Screen>
        <Stack.Screen
          name="PropertyDetails"
          component={PropertyDetailsScreen}
          options={({ route }) => ({
            title: route.params.listing.title,
            headerBackButtonDisplayMode: 'minimal',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
