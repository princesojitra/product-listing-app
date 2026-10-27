import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../di/container';
import { ProductListScreen, ProductDetailsScreen } from '../../features/products';
import { RootStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * The Products tab's own nested stack: list -> details. Extracted unchanged
 * from the old single-stack `RootNavigator` so it can be mounted as one tab
 * among others.
 */
export function ProductsNavigator() {
  return (
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
  );
}
