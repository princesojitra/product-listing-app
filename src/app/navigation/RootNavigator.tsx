import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../di/container';
import { ProductListScreen, ProductDetailsScreen } from '../../features/products';
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
      <Stack.Navigator initialRouteName="Products">
        <Stack.Screen name="Products" options={{ headerShown: false }}>
          {() => <ProductListScreen getProducts={container.getProducts} />}
        </Stack.Screen>
        <Stack.Screen
          name="ProductDetails"
          options={{
            title: 'Property Details',
            headerBackButtonDisplayMode: 'minimal',
          }}>
          {props => (
            <ProductDetailsScreen
              {...props}
              getProductDetails={container.getProductDetails}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
