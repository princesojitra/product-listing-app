import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../../di/container';
import { ProductListScreen, ProductDetailsScreen } from '../../../features/products';
import { RootStackParamList } from '../types';
import { glassHeaderScreenOptions } from '../shared/glassHeaderScreenOptions';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * The Products tab's own nested stack: list -> details. Extracted unchanged
 * from the old single-stack `RootNavigator` so it can be mounted as one tab
 * among others.
 */
export function ProductsNavigator() {
  return (
    <Stack.Navigator initialRouteName="ProductsList" screenOptions={glassHeaderScreenOptions}>
      <Stack.Screen name="ProductsList" options={{ title: 'Properties' }}>
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
