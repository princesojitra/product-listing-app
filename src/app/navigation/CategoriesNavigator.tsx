import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { container } from '../../di/container';
import { CategoriesScreen } from '../../features/categories';
import { CategoryProductsScreen, ProductDetailsScreen } from '../../features/products';
import { CategoriesStackParamList } from './navigationTypes';

const Stack = createNativeStackNavigator<CategoriesStackParamList>();

/**
 * The Categories tab's own nested stack: list -> category products ->
 * shared product details. `ProductDetails` here is the same screen
 * component the Products tab's stack uses (see `ProductsNavigator`), just
 * registered as its own route in this stack too, so each tab keeps its own
 * independent navigation history rather than hoisting details to a shared
 * root-level route.
 */
export function CategoriesNavigator() {
  return (
    <Stack.Navigator initialRouteName="CategoriesList">
      <Stack.Screen name="CategoriesList" options={{ headerShown: false }}>
        {() => <CategoriesScreen getCategories={container.getCategories} />}
      </Stack.Screen>
      <Stack.Screen
        name="CategoryProducts"
        options={({ route }) => ({
          title: route.params.categoryName,
          headerBackButtonDisplayMode: 'minimal',
        })}>
        {props => (
          <CategoryProductsScreen
            {...props}
            getProductsByCategory={container.getProductsByCategory}
          />
        )}
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
